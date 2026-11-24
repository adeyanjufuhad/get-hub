-- name: CreateMockExam :one
INSERT INTO mock_exams (
    user_id, course_id, question_ids, duration_seconds, total_questions
) VALUES (
    $1, $2, $3, $4, $5
)
RETURNING *;

-- name: GetMockExamByIDForUser :one
SELECT * FROM mock_exams
WHERE id = $1 AND user_id = $2
LIMIT 1;

-- name: ListMockExamsByUser :many
SELECT
    me.*,
    c.code AS course_code,
    c.slug AS course_slug,
    c.title AS course_title
FROM mock_exams me
JOIN courses c ON c.id = me.course_id
WHERE me.user_id = $1
ORDER BY me.created_at DESC
LIMIT 20;

-- name: SubmitMockExam :one
UPDATE mock_exams
SET
    submitted_at = NOW(),
    score = $3
WHERE id = $1 AND user_id = $2 AND submitted_at IS NULL
RETURNING *;

-- name: UpsertMockExamAnswer :one
INSERT INTO mock_exam_answers (
    mock_exam_id, question_id, selected_option_id, numeric_input, is_correct
) VALUES (
    $1, $2, $3, $4, $5
)
ON CONFLICT (mock_exam_id, question_id)
DO UPDATE SET
    selected_option_id = EXCLUDED.selected_option_id,
    numeric_input = EXCLUDED.numeric_input,
    is_correct = EXCLUDED.is_correct,
    answered_at = NOW()
RETURNING *;

-- name: ListMockExamAnswers :many
SELECT * FROM mock_exam_answers
WHERE mock_exam_id = $1;
