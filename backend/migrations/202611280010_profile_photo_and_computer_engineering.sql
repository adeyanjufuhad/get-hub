-- +goose Up
-- +goose StatementBegin
-- Profile photos and the Computer Engineering department rename.
--
-- Additive and safe to run before deploying the matching API: the old API selects
-- explicit columns, so the new avatar_url column and user_avatars table are ignored
-- until the new code ships. Run this BEFORE deploying, because the new API reads
-- users.avatar_url.

-- 1. OAU's department is Computer Engineering; there is no separate
--    "Computer Science and Engineering" department in the Faculty of Technology.
UPDATE users
SET department = 'Computer Engineering'
WHERE department = 'Computer Science and Engineering';

ALTER TABLE users ALTER COLUMN department SET DEFAULT 'Computer Engineering';

-- 2. Profile photos. The image bytes live in their own table so user rows stay
--    small; users.avatar_url holds a versioned URL ('' when there is no photo).
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS user_avatars (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('image/webp', 'image/png', 'image/jpeg')),
    data BYTEA NOT NULL CHECK (octet_length(data) <= 524288),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS user_avatars;
ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;
ALTER TABLE users ALTER COLUMN department SET DEFAULT 'Computer Science and Engineering';
-- The department rename is not reverted: there is no record of which rows changed.
-- +goose StatementEnd
