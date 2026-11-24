-- +goose Up
-- +goose StatementBegin

-- Downloadable study materials (lecture notes, past questions, tutorials, lab sheets)
-- for OAU Part 2 courses. File bytes live in object storage; this table is the catalogue.
CREATE TABLE library_courses (
    code TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    semester SMALLINT NOT NULL CHECK (semester IN (1, 2)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE library_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code TEXT NOT NULL REFERENCES library_courses (code) ON UPDATE CASCADE,
    title TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN (
        'lecture_notes', 'past_questions', 'tutorial', 'handout', 'student_notes', 'lab_manual'
    )),
    credit TEXT NOT NULL DEFAULT '',
    file_name TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL CHECK (size_bytes > 0),
    sha256 TEXT NOT NULL UNIQUE,
    object_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
    download_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_library_materials_course ON library_materials (course_code, kind);

CREATE TRIGGER trg_library_materials_updated_at
    BEFORE UPDATE ON library_materials
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS library_materials;
DROP TABLE IF EXISTS library_courses;
-- +goose StatementEnd
