-- name: CreateUser :one
INSERT INTO users (
    email, password_hash, google_id, full_name, department, level, role, avatar_color
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
)
RETURNING *;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1 LIMIT 1;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1;

-- name: GetUserByGoogleID :one
SELECT * FROM users WHERE google_id = $1 LIMIT 1;

-- name: LinkGoogleID :one
UPDATE users
SET google_id = $2
WHERE id = $1
RETURNING *;

-- name: PromoteUserToAdmin :one
UPDATE users
SET role = 'admin'
WHERE LOWER(email) = LOWER($1)
RETURNING *;

-- name: UpdateUserProfile :one
UPDATE users
SET full_name = $2, department = $3
WHERE id = $1
RETURNING *;

-- name: SetUserAvatarURL :one
UPDATE users SET avatar_url = $2 WHERE id = $1
RETURNING *;

-- name: UpsertUserAvatar :exec
INSERT INTO user_avatars (user_id, content_type, data, updated_at)
VALUES ($1, $2, $3, NOW())
ON CONFLICT (user_id) DO UPDATE
SET content_type = EXCLUDED.content_type, data = EXCLUDED.data, updated_at = NOW();

-- name: GetUserAvatar :one
SELECT * FROM user_avatars WHERE user_id = $1 LIMIT 1;

-- name: DeleteUserAvatar :exec
DELETE FROM user_avatars WHERE user_id = $1;
