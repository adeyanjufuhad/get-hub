-- name: ListQuestionsByTopic :many
SELECT * FROM questions
WHERE topic_id = $1
  AND ($2::boolean = TRUE OR status = 'published')
ORDER BY created_at ASC;

-- name: ListQuestionsByCourseRandom :many
SELECT * FROM questions
WHERE course_id = $1
  AND ($2::boolean = TRUE OR status = 'published')
ORDER BY RANDOM()
LIMIT $3;

-- name: GetQuestionByID :one
SELECT * FROM questions
WHERE id = $1
LIMIT 1;

-- name: ListQuestionsByIDs :many
SELECT * FROM questions
WHERE id = ANY($1::uuid[]);

-- name: ListQuestionOptionsByQuestionID :many
SELECT * FROM question_options
WHERE question_id = $1
ORDER BY display_order ASC, label ASC;

-- name: ListQuestionOptionsByQuestionIDs :many
SELECT * FROM question_options
WHERE question_id = ANY($1::uuid[])
ORDER BY question_id, display_order ASC, label ASC;

-- name: AdminListQuestions :many
SELECT
    q.*,
    c.code AS course_code,
    c.slug AS course_slug,
    t.title AS topic_title,
    t.slug AS topic_slug
FROM questions q
JOIN courses c ON c.id = q.course_id
JOIN topics t ON t.id = q.topic_id
WHERE ($1::uuid IS NULL OR q.course_id = $1)
  AND ($2::uuid IS NULL OR q.topic_id = $2)
  AND ($3::text = '' OR q.status = $3)
ORDER BY q.created_at DESC
LIMIT $4 OFFSET $5;

-- name: CreateQuestion :one
INSERT INTO questions (
    course_id, topic_id, question_type, prompt_md, prompt_image_url,
    numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md,
    difficulty, tags, source, year, status, is_free, created_by
) VALUES (
    $1, $2, $3, $4, $5,
    $6, $7, $8, $9,
    $10, $11, $12, $13, $14, $15, $16
)
RETURNING *;

-- name: UpdateQuestion :one
UPDATE questions
SET
    course_id = $2,
    topic_id = $3,
    question_type = $4,
    prompt_md = $5,
    prompt_image_url = $6,
    numeric_answer = $7,
    numeric_tolerance_pct = $8,
    numeric_unit = $9,
    solution_md = $10,
    difficulty = $11,
    tags = $12,
    source = $13,
    year = $14,
    status = $15,
    is_free = $16
WHERE id = $1
RETURNING *;

-- name: UpdateQuestionStatus :one
UPDATE questions
SET status = $2
WHERE id = $1
RETURNING *;

-- name: DeleteQuestion :exec
DELETE FROM questions WHERE id = $1;

-- name: DeleteQuestionOptions :exec
DELETE FROM question_options WHERE question_id = $1;

-- name: CreateQuestionOption :one
INSERT INTO question_options (
    question_id, label, content_md, image_url, is_correct, display_order
) VALUES (
    $1, $2, $3, $4, $5, $6
)
RETURNING *;
