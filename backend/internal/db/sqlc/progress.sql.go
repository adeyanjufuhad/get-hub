package sqlc

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

func (q *Queries) UpsertTopicView(ctx context.Context, userID, topicID uuid.UUID) (TopicProgress, error) {
	const query = `
INSERT INTO topic_progress (user_id, topic_id, last_viewed_at)
VALUES ($1, $2, NOW())
ON CONFLICT (user_id, topic_id)
DO UPDATE SET last_viewed_at = NOW()
RETURNING id, user_id, topic_id, last_viewed_at, completed_at, created_at, updated_at`
	row := q.db.QueryRow(ctx, query, userID, topicID)
	var tp TopicProgress
	err := row.Scan(&tp.ID, &tp.UserID, &tp.TopicID, &tp.LastViewedAt, &tp.CompletedAt, &tp.CreatedAt, &tp.UpdatedAt)
	return tp, err
}

func (q *Queries) SetTopicCompleted(ctx context.Context, userID, topicID uuid.UUID, completed bool) (TopicProgress, error) {
	const query = `
INSERT INTO topic_progress (user_id, topic_id, last_viewed_at, completed_at)
VALUES ($1, $2, NOW(), CASE WHEN $3::boolean THEN NOW() ELSE NULL END)
ON CONFLICT (user_id, topic_id)
DO UPDATE SET
    last_viewed_at = NOW(),
    completed_at = CASE WHEN $3::boolean THEN COALESCE(topic_progress.completed_at, NOW()) ELSE NULL END
RETURNING id, user_id, topic_id, last_viewed_at, completed_at, created_at, updated_at`
	row := q.db.QueryRow(ctx, query, userID, topicID, completed)
	var tp TopicProgress
	err := row.Scan(&tp.ID, &tp.UserID, &tp.TopicID, &tp.LastViewedAt, &tp.CompletedAt, &tp.CreatedAt, &tp.UpdatedAt)
	return tp, err
}

func (q *Queries) ListTopicProgressByUser(ctx context.Context, userID uuid.UUID) ([]TopicProgress, error) {
	const query = `
SELECT id, user_id, topic_id, last_viewed_at, completed_at, created_at, updated_at
FROM topic_progress WHERE user_id = $1`
	rows, err := q.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]TopicProgress, 0)
	for rows.Next() {
		var tp TopicProgress
		if err := rows.Scan(&tp.ID, &tp.UserID, &tp.TopicID, &tp.LastViewedAt, &tp.CompletedAt, &tp.CreatedAt, &tp.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, tp)
	}
	return items, rows.Err()
}

type LastViewedTopicRow struct {
	TopicID      uuid.UUID          `json:"topic_id"`
	LastViewedAt time.Time          `json:"last_viewed_at"`
	CompletedAt  pgtype.Timestamptz `json:"completed_at"`
	TopicSlug    string             `json:"topic_slug"`
	TopicTitle   string             `json:"topic_title"`
	CourseCode   string             `json:"course_code"`
	CourseSlug   string             `json:"course_slug"`
	CourseTitle  string             `json:"course_title"`
}

func (q *Queries) GetLastViewedTopic(ctx context.Context, userID uuid.UUID) (LastViewedTopicRow, error) {
	const query = `
SELECT tp.topic_id, tp.last_viewed_at, tp.completed_at, t.slug, t.title, c.code, c.slug, c.title
FROM topic_progress tp
JOIN topics t ON t.id = tp.topic_id
JOIN courses c ON c.id = t.course_id
WHERE tp.user_id = $1
ORDER BY tp.last_viewed_at DESC
LIMIT 1`
	row := q.db.QueryRow(ctx, query, userID)
	var r LastViewedTopicRow
	err := row.Scan(&r.TopicID, &r.LastViewedAt, &r.CompletedAt, &r.TopicSlug, &r.TopicTitle, &r.CourseCode, &r.CourseSlug, &r.CourseTitle)
	return r, err
}
