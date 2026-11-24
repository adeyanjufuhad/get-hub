package db

import (
	"context"
	"fmt"
	"net"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

// NewPool initializes a pgxpool tuned for Neon serverless pooled connections.
// The ping timeout allows for a Neon compute waking from scale-to-zero.
// Uses SimpleProtocol by default so PgBouncer transaction-mode pooling never
// conflicts with prepared statement caches.
func NewPool(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
	cfg, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, fmt.Errorf("parse database url: %w", err)
	}

	cfg.MaxConns = 12
	cfg.MinConns = 1
	cfg.MaxConnLifetime = 30 * time.Minute
	cfg.MaxConnIdleTime = 5 * time.Minute
	cfg.HealthCheckPeriod = 1 * time.Minute
	cfg.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol
	// Resolve IPv4 addresses first (with 1.1.1.1 DNS fallback if local hotspot DNS
	// drops CNAME lookups for *.neon.tech). pgx calls LookupFunc before DialFunc,
	// so filtering/prioritizing IPv4 here prevents 20s hangs on blackholed IPv6 routes
	// while keeping full TLS SNI for Neon's endpoint hostname.
	cfg.ConnConfig.LookupFunc = lookupIPv4First
	cfg.AfterConnect = func(_ context.Context, conn *pgx.Conn) error {
		registerUUIDTypes(conn.TypeMap())
		return nil
	}

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("create pgx pool: %w", err)
	}

	pingCtx, cancel := context.WithTimeout(ctx, 25*time.Second)
	defer cancel()
	if err := pool.Ping(pingCtx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}

	return pool, nil
}

func lookupIPv4First(ctx context.Context, host string) ([]string, error) {
	if ip := net.ParseIP(host); ip != nil {
		return []string{host}, nil
	}
	osCtx, osCancel := context.WithTimeout(ctx, 2*time.Second)
	ips, err := net.DefaultResolver.LookupIP(osCtx, "ip4", host)
	osCancel()
	if err == nil && len(ips) > 0 {
		out := make([]string, 0, len(ips))
		for _, ip := range ips {
			out = append(out, ip.String())
		}
		return out, nil
	}
	// Fallback to Cloudflare 1.1.1.1 then Google 8.8.8.8 over IPv4 UDP if local router DNS is slow/flaky.
	for _, dnsServer := range []string{"1.1.1.1:53", "8.8.8.8:53"} {
		fallback := &net.Resolver{
			PreferGo: true,
			Dial: func(ctx context.Context, _, _ string) (net.Conn, error) {
				d := net.Dialer{Timeout: 3 * time.Second}
				return d.DialContext(ctx, "udp4", dnsServer)
			},
		}
		fbCtx, fbCancel := context.WithTimeout(ctx, 4*time.Second)
		fbIPs, fbErr := fallback.LookupIP(fbCtx, "ip4", host)
		fbCancel()
		if fbErr == nil && len(fbIPs) > 0 {
			out := make([]string, 0, len(fbIPs))
			for _, ip := range fbIPs {
				out = append(out, ip.String())
			}
			return out, nil
		}
	}
	return net.DefaultResolver.LookupHost(ctx, host)
}

// registerUUIDTypes maps github.com/google/uuid to Postgres uuid / uuid[].
// In simple-protocol mode pgx gets no parameter type info from the server, so
// without this a []uuid.UUID argument (e.g. `= ANY($1::uuid[])`) fails with
// "unable to encode ... for unknown type (OID 0)".
func registerUUIDTypes(m *pgtype.Map) {
	m.RegisterDefaultPgType(uuid.UUID{}, "uuid")
	m.RegisterDefaultPgType([]uuid.UUID{}, "_uuid")
}
