package sqlc

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type CreateSessionParams struct {
	UserID           uuid.UUID
	RefreshTokenHash string
	UserAgent        string
	IpAddress        string
	ExpiresAt        time.Time
}

func (q *Queries) CreateSession(ctx context.Context, arg CreateSessionParams) (Session, error) {
	const query = `
INSERT INTO sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, user_id, refresh_token_hash, user_agent, ip_address, expires_at, revoked_at, created_at`
	row := q.db.QueryRow(ctx, query, arg.UserID, arg.RefreshTokenHash, arg.UserAgent, arg.IpAddress, arg.ExpiresAt)
	var s Session
	err := row.Scan(&s.ID, &s.UserID, &s.RefreshTokenHash, &s.UserAgent, &s.IpAddress, &s.ExpiresAt, &s.RevokedAt, &s.CreatedAt)
	return s, err
}

func (q *Queries) GetActiveSessionByTokenHash(ctx context.Context, refreshTokenHash string) (Session, error) {
	const query = `
SELECT id, user_id, refresh_token_hash, user_agent, ip_address, expires_at, revoked_at, created_at
FROM sessions
WHERE refresh_token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()
LIMIT 1`
	row := q.db.QueryRow(ctx, query, refreshTokenHash)
	var s Session
	err := row.Scan(&s.ID, &s.UserID, &s.RefreshTokenHash, &s.UserAgent, &s.IpAddress, &s.ExpiresAt, &s.RevokedAt, &s.CreatedAt)
	return s, err
}

func (q *Queries) RevokeSession(ctx context.Context, id uuid.UUID) error {
	const query = `UPDATE sessions SET revoked_at = NOW() WHERE id = $1 AND revoked_at IS NULL`
	_, err := q.db.Exec(ctx, query, id)
	return err
}

func (q *Queries) RevokeSessionByTokenHash(ctx context.Context, refreshTokenHash string) error {
	const query = `UPDATE sessions SET revoked_at = NOW() WHERE refresh_token_hash = $1 AND revoked_at IS NULL`
	_, err := q.db.Exec(ctx, query, refreshTokenHash)
	return err
}
