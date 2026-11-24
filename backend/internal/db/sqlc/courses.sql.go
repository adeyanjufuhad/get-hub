package sqlc

import (
	"context"

	"github.com/google/uuid"
)

func (q *Queries) ListActiveCourses(ctx context.Context) ([]Course, error) {
	const query = `
SELECT id, code, slug, title, description, display_order, is_active, created_at, updated_at
FROM courses
WHERE is_active = TRUE
ORDER BY display_order ASC, code ASC`
	rows, err := q.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]Course, 0)
	for rows.Next() {
		var c Course
		if err := rows.Scan(&c.ID, &c.Code, &c.Slug, &c.Title, &c.Description, &c.DisplayOrder, &c.IsActive, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, c)
	}
	return items, rows.Err()
}

func (q *Queries) GetCourseBySlug(ctx context.Context, slug string) (Course, error) {
	const query = `
SELECT id, code, slug, title, description, display_order, is_active, created_at, updated_at
FROM courses WHERE slug = $1 AND is_active = TRUE LIMIT 1`
	row := q.db.QueryRow(ctx, query, slug)
	var c Course
	err := row.Scan(&c.ID, &c.Code, &c.Slug, &c.Title, &c.Description, &c.DisplayOrder, &c.IsActive, &c.CreatedAt, &c.UpdatedAt)
	return c, err
}

func (q *Queries) GetCourseByID(ctx context.Context, id uuid.UUID) (Course, error) {
	const query = `
SELECT id, code, slug, title, description, display_order, is_active, created_at, updated_at
FROM courses WHERE id = $1 LIMIT 1`
	row := q.db.QueryRow(ctx, query, id)
	var c Course
	err := row.Scan(&c.ID, &c.Code, &c.Slug, &c.Title, &c.Description, &c.DisplayOrder, &c.IsActive, &c.CreatedAt, &c.UpdatedAt)
	return c, err
}

func (q *Queries) ListTopicsByCourse(ctx context.Context, courseID uuid.UUID, includeDraft bool) ([]Topic, error) {
	const query = `
SELECT id, course_id, slug, title, display_order, ccmas_ref, outcomes, status, is_free, created_at, updated_at
FROM topics
WHERE course_id = $1 AND ($2::boolean = TRUE OR status = 'published')
ORDER BY display_order ASC, title ASC`
	rows, err := q.db.Query(ctx, query, courseID, includeDraft)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]Topic, 0)
	for rows.Next() {
		var t Topic
		if err := rows.Scan(&t.ID, &t.CourseID, &t.Slug, &t.Title, &t.DisplayOrder, &t.CcmasRef, &t.Outcomes, &t.Status, &t.IsFree, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, t)
	}
	return items, rows.Err()
}

func (q *Queries) GetTopicByID(ctx context.Context, id uuid.UUID) (Topic, error) {
	const query = `
SELECT id, course_id, slug, title, display_order, ccmas_ref, outcomes, status, is_free, created_at, updated_at
FROM topics WHERE id = $1 LIMIT 1`
	row := q.db.QueryRow(ctx, query, id)
	var t Topic
	err := row.Scan(&t.ID, &t.CourseID, &t.Slug, &t.Title, &t.DisplayOrder, &t.CcmasRef, &t.Outcomes, &t.Status, &t.IsFree, &t.CreatedAt, &t.UpdatedAt)
	return t, err
}

type TopicWithCourseRow struct {
	ID           uuid.UUID `json:"id"`
	CourseID     uuid.UUID `json:"course_id"`
	CourseCode   string    `json:"course_code"`
	CourseSlug   string    `json:"course_slug"`
	Slug         string    `json:"slug"`
	Title        string    `json:"title"`
	DisplayOrder int32     `json:"display_order"`
	Status       string    `json:"status"`
	IsFree       bool      `json:"is_free"`
}

func (q *Queries) ListAllTopicsWithCourse(ctx context.Context) ([]TopicWithCourseRow, error) {
	const query = `
SELECT t.id, t.course_id, c.code, c.slug, t.slug, t.title, t.display_order, t.status, t.is_free
FROM topics t
JOIN courses c ON c.id = t.course_id
WHERE c.is_active = TRUE
ORDER BY c.display_order ASC, t.display_order ASC`
	rows, err := q.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]TopicWithCourseRow, 0)
	for rows.Next() {
		var r TopicWithCourseRow
		if err := rows.Scan(&r.ID, &r.CourseID, &r.CourseCode, &r.CourseSlug, &r.Slug, &r.Title, &r.DisplayOrder, &r.Status, &r.IsFree); err != nil {
			return nil, err
		}
		items = append(items, r)
	}
	return items, rows.Err()
}
