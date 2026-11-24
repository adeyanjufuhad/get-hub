-- name: UpsertTopicView :one
INSERT INTO topic_progress (user_id, topic_id, last_viewed_at)
VALUES ($1, $2, NOW())
ON CONFLICT (user_id, topic_id)
DO UPDATE SET last_viewed_at = NOW()
RETURNING *;

-- name: SetTopicCompleted :one
INSERT INTO topic_progress (user_id, topic_id, last_viewed_at, completed_at)
VALUES ($1, $2, NOW(), CASE WHEN $3::boolean THEN NOW() ELSE NULL END)
ON CONFLICT (user_id, topic_id)
DO UPDATE SET
    last_viewed_at = NOW(),
    completed_at = CASE WHEN $3::boolean THEN COALESCE(topic_progress.completed_at, NOW()) ELSE NULL END
RETURNING *;

-- name: ListTopicProgressByUser :many
SELECT * FROM topic_progress
WHERE user_id = $1;

-- name: GetLastViewedTopic :one
SELECT
    tp.topic_id,
    tp.last_viewed_at,
    tp.completed_at,
    t.slug AS topic_slug,
    t.title AS topic_title,
    c.code AS course_code,
    c.slug AS course_slug,
    c.title AS course_title
FROM topic_progress tp
JOIN topics t ON t.id = tp.topic_id
JOIN courses c ON c.id = t.course_id
WHERE tp.user_id = $1
ORDER BY tp.last_viewed_at DESC
LIMIT 1;
