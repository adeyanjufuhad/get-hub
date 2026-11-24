-- name: CreateAttempt :one
INSERT INTO attempts (
    user_id, question_id, topic_id, selected_option_id, numeric_input, is_correct, time_taken_ms
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
)
RETURNING *;

-- name: ListUserTopicStats :many
SELECT
    t.id AS topic_id,
    t.slug AS topic_slug,
    t.title AS topic_title,
    c.id AS course_id,
    c.code AS course_code,
    c.slug AS course_slug,
    COUNT(a.id)::int AS attempts_count,
    COALESCE(SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END), 0)::int AS correct_count,
    COUNT(DISTINCT a.question_id)::int AS unique_questions_attempted
FROM topics t
JOIN courses c ON c.id = t.course_id
LEFT JOIN attempts a ON a.topic_id = t.id AND a.user_id = $1
WHERE c.is_active = TRUE
  AND ($2::boolean = TRUE OR t.status = 'published')
GROUP BY t.id, t.slug, t.title, c.id, c.code, c.slug, c.display_order, t.display_order
ORDER BY c.display_order ASC, t.display_order ASC;

-- name: ListUserActivityDays :many
SELECT DISTINCT (created_at AT TIME ZONE 'Africa/Lagos')::date AS study_day
FROM attempts
WHERE user_id = $1
UNION
SELECT DISTINCT (last_viewed_at AT TIME ZONE 'Africa/Lagos')::date AS study_day
FROM topic_progress
WHERE user_id = $1
ORDER BY study_day DESC
LIMIT 90;
