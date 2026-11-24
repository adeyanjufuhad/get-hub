package db

import (
	"context"
	"fmt"
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
	cfg.AfterConnect = func(_ context.Context, conn *pgx.Conn) error {
		registerUUIDTypes(conn.TypeMap())
		return nil
	}

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("create pgx pool: %w", err)
	}

	pingCtx, cancel := context.WithTimeout(ctx, 20*time.Second)
	defer cancel()
	if err := pool.Ping(pingCtx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}

	return pool, nil
}

// registerUUIDTypes maps github.com/google/uuid to Postgres uuid / uuid[].
// In simple-protocol mode pgx gets no parameter type info from the server, so
// without this a []uuid.UUID argument (e.g. `= ANY($1::uuid[])`) fails with
// "unable to encode ... for unknown type (OID 0)".
func registerUUIDTypes(m *pgtype.Map) {
	m.RegisterDefaultPgType(uuid.UUID{}, "uuid")
	m.RegisterDefaultPgType([]uuid.UUID{}, "_uuid")
}
