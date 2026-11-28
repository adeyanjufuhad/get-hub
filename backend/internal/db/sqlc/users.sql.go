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
RETURNING id, email, password_hash, google_id, full_name, department, level, role, avatar_color, created_at, updated_at, avatar_url`
	row := q.db.QueryRow(ctx, query,
		arg.Email, arg.PasswordHash, arg.GoogleID, arg.FullName, arg.Department, arg.Level, arg.Role, arg.AvatarColor,
	)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.GoogleID, &u.FullName, &u.Department, &u.Level, &u.Role, &u.AvatarColor, &u.CreatedAt, &u.UpdatedAt, &u.AvatarURL)
	return u, err
}

func (q *Queries) GetUserByID(ctx context.Context, id uuid.UUID) (User, error) {
	const query = `
SELECT id, email, password_hash, google_id, full_name, department, level, role, avatar_color, created_at, updated_at, avatar_url
FROM users WHERE id = $1 LIMIT 1`
	row := q.db.QueryRow(ctx, query, id)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.GoogleID, &u.FullName, &u.Department, &u.Level, &u.Role, &u.AvatarColor, &u.CreatedAt, &u.UpdatedAt, &u.AvatarURL)
	return u, err
}

func (q *Queries) GetUserByEmail(ctx context.Context, email string) (User, error) {
	const query = `
SELECT id, email, password_hash, google_id, full_name, department, level, role, avatar_color, created_at, updated_at, avatar_url
FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`
	row := q.db.QueryRow(ctx, query, email)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.GoogleID, &u.FullName, &u.Department, &u.Level, &u.Role, &u.AvatarColor, &u.CreatedAt, &u.UpdatedAt, &u.AvatarURL)
	return u, err
}

func (q *Queries) GetUserByGoogleID(ctx context.Context, googleID pgtype.Text) (User, error) {
	const query = `
SELECT id, email, password_hash, google_id, full_name, department, level, role, avatar_color, created_at, updated_at, avatar_url
FROM users WHERE google_id = $1 LIMIT 1`
	row := q.db.QueryRow(ctx, query, googleID)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.GoogleID, &u.FullName, &u.Department, &u.Level, &u.Role, &u.AvatarColor, &u.CreatedAt, &u.UpdatedAt, &u.AvatarURL)
	return u, err
}

func (q *Queries) LinkGoogleID(ctx context.Context, id uuid.UUID, googleID pgtype.Text) (User, error) {
	const query = `
UPDATE users SET google_id = $2 WHERE id = $1
RETURNING id, email, password_hash, google_id, full_name, department, level, role, avatar_color, created_at, updated_at, avatar_url`
	row := q.db.QueryRow(ctx, query, id, googleID)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.GoogleID, &u.FullName, &u.Department, &u.Level, &u.Role, &u.AvatarColor, &u.CreatedAt, &u.UpdatedAt, &u.AvatarURL)
	return u, err
}

func (q *Queries) PromoteUserToAdmin(ctx context.Context, email string) (User, error) {
	const query = `
UPDATE users SET role = 'admin' WHERE LOWER(email) = LOWER($1)
RETURNING id, email, password_hash, google_id, full_name, department, level, role, avatar_color, created_at, updated_at, avatar_url`
	row := q.db.QueryRow(ctx, query, email)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.GoogleID, &u.FullName, &u.Department, &u.Level, &u.Role, &u.AvatarColor, &u.CreatedAt, &u.UpdatedAt, &u.AvatarURL)
	return u, err
}

type UpdateUserProfileParams struct {
	ID         uuid.UUID
	FullName   string
	Department string
}

func (q *Queries) UpdateUserProfile(ctx context.Context, arg UpdateUserProfileParams) (User, error) {
	const query = `
UPDATE users SET full_name = $2, department = $3 WHERE id = $1
RETURNING id, email, password_hash, google_id, full_name, department, level, role, avatar_color, created_at, updated_at, avatar_url`
	row := q.db.QueryRow(ctx, query, arg.ID, arg.FullName, arg.Department)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.GoogleID, &u.FullName, &u.Department, &u.Level, &u.Role, &u.AvatarColor, &u.CreatedAt, &u.UpdatedAt, &u.AvatarURL)
	return u, err
}

func (q *Queries) SetUserAvatarURL(ctx context.Context, id uuid.UUID, avatarURL string) (User, error) {
	const query = `
UPDATE users SET avatar_url = $2 WHERE id = $1
RETURNING id, email, password_hash, google_id, full_name, department, level, role, avatar_color, created_at, updated_at, avatar_url`
	row := q.db.QueryRow(ctx, query, id, avatarURL)
	var u User
	err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.GoogleID, &u.FullName, &u.Department, &u.Level, &u.Role, &u.AvatarColor, &u.CreatedAt, &u.UpdatedAt, &u.AvatarURL)
	return u, err
}

type UpsertUserAvatarParams struct {
	UserID      uuid.UUID
	ContentType string
	Data        []byte
}

func (q *Queries) UpsertUserAvatar(ctx context.Context, arg UpsertUserAvatarParams) error {
	const query = `
INSERT INTO user_avatars (user_id, content_type, data, updated_at)
VALUES ($1, $2, $3, NOW())
ON CONFLICT (user_id) DO UPDATE
SET content_type = EXCLUDED.content_type, data = EXCLUDED.data, updated_at = NOW()`
	_, err := q.db.Exec(ctx, query, arg.UserID, arg.ContentType, arg.Data)
	return err
}

func (q *Queries) GetUserAvatar(ctx context.Context, userID uuid.UUID) (UserAvatar, error) {
	const query = `
SELECT user_id, content_type, data, updated_at FROM user_avatars WHERE user_id = $1 LIMIT 1`
	row := q.db.QueryRow(ctx, query, userID)
	var a UserAvatar
	err := row.Scan(&a.UserID, &a.ContentType, &a.Data, &a.UpdatedAt)
	return a, err
}

func (q *Queries) DeleteUserAvatar(ctx context.Context, userID uuid.UUID) error {
	const query = `DELETE FROM user_avatars WHERE user_id = $1`
	_, err := q.db.Exec(ctx, query, userID)
	return err
}
