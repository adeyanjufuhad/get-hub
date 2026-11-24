package sqlc

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type CreateAttemptParams struct {
	UserID           uuid.UUID
	QuestionID       uuid.UUID
	TopicID          uuid.UUID
	SelectedOptionID pgtype.UUID
	NumericInput     pgtype.Float8
	IsCorrect        bool
	TimeTakenMs      int32
}

func (q *Queries) CreateAttempt(ctx context.Context, arg CreateAttemptParams) (Attempt, error) {
	const query = `
INSERT INTO attempts (user_id, question_id, topic_id, selected_option_id, numeric_input, is_correct, time_taken_ms)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, user_id, question_id, topic_id, selected_option_id, numeric_input, is_correct, time_taken_ms, created_at`
	row := q.db.QueryRow(ctx, query, arg.UserID, arg.QuestionID, arg.TopicID, arg.SelectedOptionID, arg.NumericInput, arg.IsCorrect, arg.TimeTakenMs)
	var a Attempt
	err := row.Scan(&a.ID, &a.UserID, &a.QuestionID, &a.TopicID, &a.SelectedOptionID, &a.NumericInput, &a.IsCorrect, &a.TimeTakenMs, &a.CreatedAt)
	return a, err
}

type UserTopicStatRow struct {
	TopicID                  uuid.UUID `json:"topic_id"`
	TopicSlug                string    `json:"topic_slug"`
	TopicTitle               string    `json:"topic_title"`
	CourseID                 uuid.UUID `json:"course_id"`
	CourseCode               string    `json:"course_code"`
	CourseSlug               string    `json:"course_slug"`
	AttemptsCount            int32     `json:"attempts_count"`
	CorrectCount             int32     `json:"correct_count"`
	UniqueQuestionsAttempted int32     `json:"unique_questions_attempted"`
}

func (q *Queries) ListUserTopicStats(ctx context.Context, userID uuid.UUID, includeDraft bool) ([]UserTopicStatRow, error) {
	const query = `
SELECT
    t.id, t.slug, t.title, c.id, c.code, c.slug,
    COUNT(a.id)::int AS attempts_count,
    COALESCE(SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END), 0)::int AS correct_count,
    COUNT(DISTINCT a.question_id)::int AS unique_questions_attempted
FROM topics t
JOIN courses c ON c.id = t.course_id
LEFT JOIN attempts a ON a.topic_id = t.id AND a.user_id = $1
WHERE c.is_active = TRUE
  AND ($2::boolean = TRUE OR t.status = 'published')
GROUP BY t.id, t.slug, t.title, c.id, c.code, c.slug, c.display_order, t.display_order
ORDER BY c.display_order ASC, t.display_order ASC`
	rows, err := q.db.Query(ctx, query, userID, includeDraft)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]UserTopicStatRow, 0)
	for rows.Next() {
		var r UserTopicStatRow
		if err := rows.Scan(&r.TopicID, &r.TopicSlug, &r.TopicTitle, &r.CourseID, &r.CourseCode, &r.CourseSlug, &r.AttemptsCount, &r.CorrectCount, &r.UniqueQuestionsAttempted); err != nil {
			return nil, err
		}
		items = append(items, r)
	}
	return items, rows.Err()
}

func (q *Queries) ListUserActivityDays(ctx context.Context, userID uuid.UUID) ([]time.Time, error) {
	const query = `
SELECT DISTINCT (created_at AT TIME ZONE 'Africa/Lagos')::date AS study_day
FROM attempts WHERE user_id = $1
UNION
SELECT DISTINCT (last_viewed_at AT TIME ZONE 'Africa/Lagos')::date AS study_day
FROM topic_progress WHERE user_id = $1
ORDER BY study_day DESC
LIMIT 90`
	rows, err := q.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	days := make([]time.Time, 0)
	for rows.Next() {
		var d time.Time
		if err := rows.Scan(&d); err != nil {
			return nil, err
		}
		days = append(days, d)
	}
	return days, rows.Err()
}
