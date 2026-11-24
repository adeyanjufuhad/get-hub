-- name: ListActiveCourses :many
SELECT * FROM courses
WHERE is_active = TRUE
ORDER BY display_order ASC, code ASC;

-- name: GetCourseBySlug :one
SELECT * FROM courses
WHERE slug = $1 AND is_active = TRUE
LIMIT 1;

-- name: GetCourseByID :one
SELECT * FROM courses
WHERE id = $1
LIMIT 1;

-- name: ListTopicsByCourse :many
SELECT * FROM topics
WHERE course_id = $1
  AND ($2::boolean = TRUE OR status = 'published')
ORDER BY display_order ASC, title ASC;

-- name: GetTopicByID :one
SELECT * FROM topics
WHERE id = $1
LIMIT 1;

-- name: GetTopicBySlugs :one
SELECT t.* FROM topics t
JOIN courses c ON c.id = t.course_id
WHERE c.slug = $1 AND t.slug = $2
LIMIT 1;

-- name: ListAllTopicsWithCourse :many
SELECT
    t.id,
    t.course_id,
    c.code AS course_code,
    c.slug AS course_slug,
    t.slug,
    t.title,
    t.display_order,
    t.status,
    t.is_free
FROM topics t
JOIN courses c ON c.id = t.course_id
WHERE c.is_active = TRUE
ORDER BY c.display_order ASC, t.display_order ASC;
