package library

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ErrNotFound means no published material has that id.
var ErrNotFound = errors.New("library material not found")

type Course struct {
	Code          string `json:"code"`
	Title         string `json:"title"`
	Semester      int16  `json:"semester"`
	MaterialCount int    `json:"material_count"`
}

type Material struct {
	ID            uuid.UUID `json:"id"`
	CourseCode    string    `json:"course_code"`
	Title         string    `json:"title"`
	Kind          string    `json:"kind"`
	Credit        string    `json:"credit"`
	FileName      string    `json:"file_name"`
	ContentType   string    `json:"content_type"`
	SizeBytes     int64     `json:"size_bytes"`
	DownloadCount int       `json:"download_count"`
	CreatedAt     time.Time `json:"created_at"`
	objectKey     string
}

func (m Material) ObjectKey() string { return m.objectKey }

// Repo reads and writes the library catalogue.
type Repo struct {
	pool *pgxpool.Pool
}

func NewRepo(pool *pgxpool.Pool) *Repo { return &Repo{pool: pool} }

func (r *Repo) ListCourses(ctx context.Context) ([]Course, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT c.code, c.title, c.semester, COUNT(m.id)::int
		FROM library_courses c
		LEFT JOIN library_materials m ON m.course_code = c.code AND m.status = 'published'
		GROUP BY c.code
		ORDER BY c.semester, c.code`)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (Course, error) {
		var c Course
		err := row.Scan(&c.Code, &c.Title, &c.Semester, &c.MaterialCount)
		return c, err
	})
}

const materialColumns = `id, course_code, title, kind, credit, file_name, content_type, size_bytes, download_count, created_at, object_key`

func scanMaterial(row pgx.Row) (Material, error) {
	var m Material
	err := row.Scan(&m.ID, &m.CourseCode, &m.Title, &m.Kind, &m.Credit, &m.FileName,
		&m.ContentType, &m.SizeBytes, &m.DownloadCount, &m.CreatedAt, &m.objectKey)
	return m, err
}

func (r *Repo) ListMaterials(ctx context.Context) ([]Material, error) {
	rows, err := r.pool.Query(ctx, `SELECT `+materialColumns+`
		FROM library_materials
		WHERE status = 'published'
		ORDER BY course_code,
			CASE kind
				WHEN 'handout' THEN 0 WHEN 'lecture_notes' THEN 1 WHEN 'student_notes' THEN 2
				WHEN 'tutorial' THEN 3 WHEN 'lab_manual' THEN 4 ELSE 5
			END,
			title`)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (Material, error) { return scanMaterial(row) })
}

func (r *Repo) GetPublished(ctx context.Context, id uuid.UUID) (Material, error) {
	m, err := scanMaterial(r.pool.QueryRow(ctx, `SELECT `+materialColumns+`
		FROM library_materials WHERE id = $1 AND status = 'published'`, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return Material{}, ErrNotFound
	}
	return m, err
}

func (r *Repo) IncrementDownloads(ctx context.Context, id uuid.UUID) error {
	_, err := r.pool.Exec(ctx, `UPDATE library_materials SET download_count = download_count + 1 WHERE id = $1`, id)
	return err
}

// UpsertCourse inserts or renames a library course.
func (r *Repo) UpsertCourse(ctx context.Context, code, title string, semester int16) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO library_courses (code, title, semester) VALUES ($1, $2, $3)
		ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title, semester = EXCLUDED.semester`,
		code, title, semester)
	return err
}

// NewMaterial is what the importer writes; the file's sha256 is the identity.
type NewMaterial struct {
	CourseCode  string
	Title       string
	Kind        string
	Credit      string
	FileName    string
	ContentType string
	SizeBytes   int64
	SHA256      string
	ObjectKey   string
}

// UpsertMaterial inserts a material, or refreshes its metadata if the same file was imported before.
func (r *Repo) UpsertMaterial(ctx context.Context, m NewMaterial) (inserted bool, err error) {
	err = r.pool.QueryRow(ctx, `
		INSERT INTO library_materials
			(course_code, title, kind, credit, file_name, content_type, size_bytes, sha256, object_key)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (sha256) DO UPDATE SET
			course_code = EXCLUDED.course_code, title = EXCLUDED.title, kind = EXCLUDED.kind,
			credit = EXCLUDED.credit, file_name = EXCLUDED.file_name, content_type = EXCLUDED.content_type
		RETURNING (xmax = 0)`,
		m.CourseCode, m.Title, m.Kind, m.Credit, m.FileName, m.ContentType, m.SizeBytes, m.SHA256, m.ObjectKey,
	).Scan(&inserted)
	return inserted, err
}
