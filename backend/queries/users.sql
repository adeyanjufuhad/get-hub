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
