package sqlc

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type CreateUserParams struct {
	Email        string
	PasswordHash pgtype.Text
	GoogleID     pgtype.Text
	FullName     string
	Department   string
	Level        string
	Role         string
	AvatarColor  string
}

func (q *Queries) CreateUser(ctx context.Context, arg CreateUserParams) (User, error) {
	const query = `
INSERT INTO users (
    email, password_hash, google_id, full_name, department, level, role, avatar_color
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
)
RETURNING id, email, password_hash, google_id, full_name, department, level, role, avatar_color, created_at, updated_at`
	row := q.db.QueryRow(ctx, query,
		arg.Email, arg.PasswordHash, arg.GoogleID, arg.FullName, arg.Department, arg.Level, arg.Role, arg.AvatarColor,
	)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.GoogleID, &u.FullName, &u.Department, &u.Level, &u.Role, &u.AvatarColor, &u.CreatedAt, &u.UpdatedAt)
	return u, err
}

func (q *Queries) GetUserByID(ctx context.Context, id uuid.UUID) (User, error) {
	const query = `
SELECT id, email, password_hash, google_id, full_name, department, level, role, avatar_color, created_at, updated_at
FROM users WHERE id = $1 LIMIT 1`
	row := q.db.QueryRow(ctx, query, id)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.GoogleID, &u.FullName, &u.Department, &u.Level, &u.Role, &u.AvatarColor, &u.CreatedAt, &u.UpdatedAt)
	return u, err
}

func (q *Queries) GetUserByEmail(ctx context.Context, email string) (User, error) {
	const query = `
SELECT id, email, password_hash, google_id, full_name, department, level, role, avatar_color, created_at, updated_at
FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`
	row := q.db.QueryRow(ctx, query, email)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.GoogleID, &u.FullName, &u.Department, &u.Level, &u.Role, &u.AvatarColor, &u.CreatedAt, &u.UpdatedAt)
	return u, err
}

func (q *Queries) GetUserByGoogleID(ctx context.Context, googleID pgtype.Text) (User, error) {
	const query = `
SELECT id, email, password_hash, google_id, full_name, department, level, role, avatar_color, created_at, updated_at
FROM users WHERE google_id = $1 LIMIT 1`
	row := q.db.QueryRow(ctx, query, googleID)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.GoogleID, &u.FullName, &u.Department, &u.Level, &u.Role, &u.AvatarColor, &u.CreatedAt, &u.UpdatedAt)
	return u, err
}

func (q *Queries) LinkGoogleID(ctx context.Context, id uuid.UUID, googleID pgtype.Text) (User, error) {
	const query = `
UPDATE users SET google_id = $2 WHERE id = $1
RETURNING id, email, password_hash, google_id, full_name, department, level, role, avatar_color, created_at, updated_at`
	row := q.db.QueryRow(ctx, query, id, googleID)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.GoogleID, &u.FullName, &u.Department, &u.Level, &u.Role, &u.AvatarColor, &u.CreatedAt, &u.UpdatedAt)
	return u, err
}

func (q *Queries) PromoteUserToAdmin(ctx context.Context, email string) (User, error) {
	const query = `
UPDATE users SET role = 'admin' WHERE LOWER(email) = LOWER($1)
RETURNING id, email, password_hash, google_id, full_name, department, level, role, avatar_color, created_at, updated_at`
	row := q.db.QueryRow(ctx, query, email)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.GoogleID, &u.FullName, &u.Department, &u.Level, &u.Role, &u.AvatarColor, &u.CreatedAt, &u.UpdatedAt)
	return u, err
}

type UpdateUserProfileParams struct {
	ID         uuid.UUID
	FullName   string
	Department string
	Level      string
}

func (q *Queries) UpdateUserProfile(ctx context.Context, arg UpdateUserProfileParams) (User, error) {
	const query = `
UPDATE users SET full_name = $2, department = $3, level = $4 WHERE id = $1
RETURNING id, email, password_hash, google_id, full_name, department, level, role, avatar_color, created_at, updated_at`
	row := q.db.QueryRow(ctx, query, arg.ID, arg.FullName, arg.Department, arg.Level)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.GoogleID, &u.FullName, &u.Department, &u.Level, &u.Role, &u.AvatarColor, &u.CreatedAt, &u.UpdatedAt)
	return u, err
}
