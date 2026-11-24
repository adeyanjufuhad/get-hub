package sqlc

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

func scanQuestion(scan func(dest ...any) error) (Question, error) {
	var q Question
	err := scan(
		&q.ID, &q.CourseID, &q.TopicID, &q.QuestionType, &q.PromptMd, &q.PromptImageUrl,
		&q.NumericAnswer, &q.NumericTolerancePct, &q.NumericUnit, &q.SolutionMd,
		&q.Difficulty, &q.Tags, &q.Source, &q.Year, &q.Status, &q.IsFree,
		&q.CreatedBy, &q.CreatedAt, &q.UpdatedAt,
	)
	if q.Tags == nil {
		q.Tags = []string{}
	}
	return q, err
}

const questionCols = `id, course_id, topic_id, question_type, prompt_md, prompt_image_url,
numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md,
difficulty, tags, source, year, status, is_free, created_by, created_at, updated_at`

func (q *Queries) ListQuestionsByTopic(ctx context.Context, topicID uuid.UUID, includeDraft bool) ([]Question, error) {
	const query = `SELECT ` + questionCols + ` FROM questions WHERE topic_id = $1 AND ($2::boolean = TRUE OR status = 'published') ORDER BY created_at ASC`
	rows, err := q.db.Query(ctx, query, topicID, includeDraft)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]Question, 0)
	for rows.Next() {
		item, err := scanQuestion(rows.Scan)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (q *Queries) ListQuestionsByCourseRandom(ctx context.Context, courseID uuid.UUID, includeDraft bool, limit int32) ([]Question, error) {
	const query = `SELECT ` + questionCols + ` FROM questions WHERE course_id = $1 AND ($2::boolean = TRUE OR status = 'published') ORDER BY RANDOM() LIMIT $3`
	rows, err := q.db.Query(ctx, query, courseID, includeDraft, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]Question, 0)
	for rows.Next() {
		item, err := scanQuestion(rows.Scan)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (q *Queries) GetQuestionByID(ctx context.Context, id uuid.UUID) (Question, error) {
	const query = `SELECT ` + questionCols + ` FROM questions WHERE id = $1 LIMIT 1`
	row := q.db.QueryRow(ctx, query, id)
	return scanQuestion(row.Scan)
}

func (q *Queries) ListQuestionsByIDs(ctx context.Context, ids []uuid.UUID) ([]Question, error) {
	const query = `SELECT ` + questionCols + ` FROM questions WHERE id = ANY($1::uuid[])`
	rows, err := q.db.Query(ctx, query, ids)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]Question, 0)
	for rows.Next() {
		item, err := scanQuestion(rows.Scan)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (q *Queries) ListQuestionOptionsByQuestionID(ctx context.Context, questionID uuid.UUID) ([]QuestionOption, error) {
	const query = `
SELECT id, question_id, label, content_md, image_url, is_correct, display_order
FROM question_options WHERE question_id = $1 ORDER BY display_order ASC, label ASC`
	rows, err := q.db.Query(ctx, query, questionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]QuestionOption, 0)
	for rows.Next() {
		var o QuestionOption
		if err := rows.Scan(&o.ID, &o.QuestionID, &o.Label, &o.ContentMd, &o.ImageUrl, &o.IsCorrect, &o.DisplayOrder); err != nil {
			return nil, err
		}
		items = append(items, o)
	}
	return items, rows.Err()
}

func (q *Queries) ListQuestionOptionsByQuestionIDs(ctx context.Context, questionIDs []uuid.UUID) ([]QuestionOption, error) {
	const query = `
SELECT id, question_id, label, content_md, image_url, is_correct, display_order
FROM question_options WHERE question_id = ANY($1::uuid[]) ORDER BY question_id, display_order ASC, label ASC`
	rows, err := q.db.Query(ctx, query, questionIDs)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]QuestionOption, 0)
	for rows.Next() {
		var o QuestionOption
		if err := rows.Scan(&o.ID, &o.QuestionID, &o.Label, &o.ContentMd, &o.ImageUrl, &o.IsCorrect, &o.DisplayOrder); err != nil {
			return nil, err
		}
		items = append(items, o)
	}
	return items, rows.Err()
}

type AdminQuestionRow struct {
	Question
	CourseCode string `json:"course_code"`
	CourseSlug string `json:"course_slug"`
	TopicTitle string `json:"topic_title"`
	TopicSlug  string `json:"topic_slug"`
}

type AdminListQuestionsParams struct {
	CourseID pgtype.UUID
	TopicID  pgtype.UUID
	Status   string
	Limit    int32
	Offset   int32
}

func (q *Queries) AdminListQuestions(ctx context.Context, arg AdminListQuestionsParams) ([]AdminQuestionRow, error) {
	const query = `
SELECT
    q.id, q.course_id, q.topic_id, q.question_type, q.prompt_md, q.prompt_image_url,
    q.numeric_answer, q.numeric_tolerance_pct, q.numeric_unit, q.solution_md,
    q.difficulty, q.tags, q.source, q.year, q.status, q.is_free, q.created_by, q.created_at, q.updated_at,
    c.code, c.slug, t.title, t.slug
FROM questions q
JOIN courses c ON c.id = q.course_id
JOIN topics t ON t.id = q.topic_id
WHERE ($1::uuid IS NULL OR q.course_id = $1)
  AND ($2::uuid IS NULL OR q.topic_id = $2)
  AND ($3::text = '' OR q.status = $3)
ORDER BY q.created_at DESC
LIMIT $4 OFFSET $5`
	rows, err := q.db.Query(ctx, query, arg.CourseID, arg.TopicID, arg.Status, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]AdminQuestionRow, 0)
	for rows.Next() {
		var r AdminQuestionRow
		err := rows.Scan(
			&r.ID, &r.CourseID, &r.TopicID, &r.QuestionType, &r.PromptMd, &r.PromptImageUrl,
			&r.NumericAnswer, &r.NumericTolerancePct, &r.NumericUnit, &r.SolutionMd,
			&r.Difficulty, &r.Tags, &r.Source, &r.Year, &r.Status, &r.IsFree, &r.CreatedBy, &r.CreatedAt, &r.UpdatedAt,
			&r.CourseCode, &r.CourseSlug, &r.TopicTitle, &r.TopicSlug,
		)
		if err != nil {
			return nil, err
		}
		if r.Tags == nil {
			r.Tags = []string{}
		}
		items = append(items, r)
	}
	return items, rows.Err()
}

type UpsertQuestionParams struct {
	ID                  uuid.UUID
	CourseID            uuid.UUID
	TopicID             uuid.UUID
	QuestionType        string
	PromptMd            string
	PromptImageUrl      pgtype.Text
	NumericAnswer       pgtype.Float8
	NumericTolerancePct float64
	NumericUnit         string
	SolutionMd          string
	Difficulty          string
	Tags                []string
	Source              string
	Year                pgtype.Int4
	Status              string
	IsFree              bool
	CreatedBy           pgtype.UUID
}

func (q *Queries) CreateQuestion(ctx context.Context, arg UpsertQuestionParams) (Question, error) {
	const query = `
INSERT INTO questions (
    course_id, topic_id, question_type, prompt_md, prompt_image_url,
    numeric_answer, numeric_tolerance_pct, numeric_unit, solution_md,
    difficulty, tags, source, year, status, is_free, created_by
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
)
RETURNING ` + questionCols
	row := q.db.QueryRow(ctx, query,
		arg.CourseID, arg.TopicID, arg.QuestionType, arg.PromptMd, arg.PromptImageUrl,
		arg.NumericAnswer, arg.NumericTolerancePct, arg.NumericUnit, arg.SolutionMd,
		arg.Difficulty, arg.Tags, arg.Source, arg.Year, arg.Status, arg.IsFree, arg.CreatedBy,
	)
	return scanQuestion(row.Scan)
}

func (q *Queries) UpdateQuestion(ctx context.Context, arg UpsertQuestionParams) (Question, error) {
	const query = `
UPDATE questions
SET course_id = $2, topic_id = $3, question_type = $4, prompt_md = $5, prompt_image_url = $6,
    numeric_answer = $7, numeric_tolerance_pct = $8, numeric_unit = $9, solution_md = $10,
    difficulty = $11, tags = $12, source = $13, year = $14, status = $15, is_free = $16
WHERE id = $1
RETURNING ` + questionCols
	row := q.db.QueryRow(ctx, query,
		arg.ID, arg.CourseID, arg.TopicID, arg.QuestionType, arg.PromptMd, arg.PromptImageUrl,
		arg.NumericAnswer, arg.NumericTolerancePct, arg.NumericUnit, arg.SolutionMd,
		arg.Difficulty, arg.Tags, arg.Source, arg.Year, arg.Status, arg.IsFree,
	)
	return scanQuestion(row.Scan)
}

func (q *Queries) UpdateQuestionStatus(ctx context.Context, id uuid.UUID, status string) (Question, error) {
	const query = `UPDATE questions SET status = $2 WHERE id = $1 RETURNING ` + questionCols
	row := q.db.QueryRow(ctx, query, id, status)
	return scanQuestion(row.Scan)
}

func (q *Queries) DeleteQuestion(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.Exec(ctx, `DELETE FROM questions WHERE id = $1`, id)
	return err
}

func (q *Queries) DeleteQuestionOptions(ctx context.Context, questionID uuid.UUID) error {
	_, err := q.db.Exec(ctx, `DELETE FROM question_options WHERE question_id = $1`, questionID)
	return err
}

type CreateQuestionOptionParams struct {
	QuestionID   uuid.UUID
	Label        string
	ContentMd    string
	ImageUrl     pgtype.Text
	IsCorrect    bool
	DisplayOrder int32
}

func (q *Queries) CreateQuestionOption(ctx context.Context, arg CreateQuestionOptionParams) (QuestionOption, error) {
	const query = `
INSERT INTO question_options (question_id, label, content_md, image_url, is_correct, display_order)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, question_id, label, content_md, image_url, is_correct, display_order`
	row := q.db.QueryRow(ctx, query, arg.QuestionID, arg.Label, arg.ContentMd, arg.ImageUrl, arg.IsCorrect, arg.DisplayOrder)
	var o QuestionOption
	err := row.Scan(&o.ID, &o.QuestionID, &o.Label, &o.ContentMd, &o.ImageUrl, &o.IsCorrect, &o.DisplayOrder)
	return o, err
}
