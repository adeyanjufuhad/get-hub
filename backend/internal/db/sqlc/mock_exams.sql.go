package sqlc

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type CreateMockExamParams struct {
	UserID          uuid.UUID
	CourseID        uuid.UUID
	QuestionIds     []uuid.UUID
	DurationSeconds int32
	TotalQuestions  int32
}

func (q *Queries) CreateMockExam(ctx context.Context, arg CreateMockExamParams) (MockExam, error) {
	const query = `
INSERT INTO mock_exams (user_id, course_id, question_ids, duration_seconds, total_questions)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, user_id, course_id, question_ids, duration_seconds, started_at, submitted_at, score, total_questions, created_at`
	row := q.db.QueryRow(ctx, query, arg.UserID, arg.CourseID, arg.QuestionIds, arg.DurationSeconds, arg.TotalQuestions)
	var m MockExam
	err := row.Scan(&m.ID, &m.UserID, &m.CourseID, &m.QuestionIds, &m.DurationSeconds, &m.StartedAt, &m.SubmittedAt, &m.Score, &m.TotalQuestions, &m.CreatedAt)
	return m, err
}

func (q *Queries) GetMockExamByIDForUser(ctx context.Context, id, userID uuid.UUID) (MockExam, error) {
	const query = `
SELECT id, user_id, course_id, question_ids, duration_seconds, started_at, submitted_at, score, total_questions, created_at
FROM mock_exams WHERE id = $1 AND user_id = $2 LIMIT 1`
	row := q.db.QueryRow(ctx, query, id, userID)
	var m MockExam
	err := row.Scan(&m.ID, &m.UserID, &m.CourseID, &m.QuestionIds, &m.DurationSeconds, &m.StartedAt, &m.SubmittedAt, &m.Score, &m.TotalQuestions, &m.CreatedAt)
	return m, err
}

type MockExamSummaryRow struct {
	MockExam
	CourseCode  string `json:"course_code"`
	CourseSlug  string `json:"course_slug"`
	CourseTitle string `json:"course_title"`
}

func (q *Queries) ListMockExamsByUser(ctx context.Context, userID uuid.UUID) ([]MockExamSummaryRow, error) {
	const query = `
SELECT me.id, me.user_id, me.course_id, me.question_ids, me.duration_seconds, me.started_at, me.submitted_at, me.score, me.total_questions, me.created_at,
       c.code, c.slug, c.title
FROM mock_exams me
JOIN courses c ON c.id = me.course_id
WHERE me.user_id = $1
ORDER BY me.created_at DESC
LIMIT 20`
	rows, err := q.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]MockExamSummaryRow, 0)
	for rows.Next() {
		var r MockExamSummaryRow
		if err := rows.Scan(
			&r.ID, &r.UserID, &r.CourseID, &r.QuestionIds, &r.DurationSeconds, &r.StartedAt, &r.SubmittedAt, &r.Score, &r.TotalQuestions, &r.CreatedAt,
			&r.CourseCode, &r.CourseSlug, &r.CourseTitle,
		); err != nil {
			return nil, err
		}
		items = append(items, r)
	}
	return items, rows.Err()
}

func (q *Queries) SubmitMockExam(ctx context.Context, id, userID uuid.UUID, score int32) (MockExam, error) {
	const query = `
UPDATE mock_exams SET submitted_at = NOW(), score = $3
WHERE id = $1 AND user_id = $2 AND submitted_at IS NULL
RETURNING id, user_id, course_id, question_ids, duration_seconds, started_at, submitted_at, score, total_questions, created_at`
	row := q.db.QueryRow(ctx, query, id, userID, score)
	var m MockExam
	err := row.Scan(&m.ID, &m.UserID, &m.CourseID, &m.QuestionIds, &m.DurationSeconds, &m.StartedAt, &m.SubmittedAt, &m.Score, &m.TotalQuestions, &m.CreatedAt)
	return m, err
}

type UpsertMockExamAnswerParams struct {
	MockExamID       uuid.UUID
	QuestionID       uuid.UUID
	SelectedOptionID pgtype.UUID
	NumericInput     pgtype.Float8
	IsCorrect        pgtype.Bool
}

func (q *Queries) UpsertMockExamAnswer(ctx context.Context, arg UpsertMockExamAnswerParams) (MockExamAnswer, error) {
	const query = `
INSERT INTO mock_exam_answers (mock_exam_id, question_id, selected_option_id, numeric_input, is_correct)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (mock_exam_id, question_id)
DO UPDATE SET selected_option_id = EXCLUDED.selected_option_id, numeric_input = EXCLUDED.numeric_input, is_correct = EXCLUDED.is_correct, answered_at = NOW()
RETURNING id, mock_exam_id, question_id, selected_option_id, numeric_input, is_correct, answered_at`
	row := q.db.QueryRow(ctx, query, arg.MockExamID, arg.QuestionID, arg.SelectedOptionID, arg.NumericInput, arg.IsCorrect)
	var a MockExamAnswer
	err := row.Scan(&a.ID, &a.MockExamID, &a.QuestionID, &a.SelectedOptionID, &a.NumericInput, &a.IsCorrect, &a.AnsweredAt)
	return a, err
}

func (q *Queries) ListMockExamAnswers(ctx context.Context, mockExamID uuid.UUID) ([]MockExamAnswer, error) {
	const query = `
SELECT id, mock_exam_id, question_id, selected_option_id, numeric_input, is_correct, answered_at
FROM mock_exam_answers WHERE mock_exam_id = $1`
	rows, err := q.db.Query(ctx, query, mockExamID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]MockExamAnswer, 0)
	for rows.Next() {
		var a MockExamAnswer
		if err := rows.Scan(&a.ID, &a.MockExamID, &a.QuestionID, &a.SelectedOptionID, &a.NumericInput, &a.IsCorrect, &a.AnsweredAt); err != nil {
			return nil, err
		}
		items = append(items, a)
	}
	return items, rows.Err()
}
