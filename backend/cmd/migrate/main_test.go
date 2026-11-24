package main

import (
	"path/filepath"
	"strings"
	"testing"
)

func TestExtractGooseUpSQL(t *testing.T) {
	sample := "-- +goose Up\r\n" +
		"-- +goose StatementBegin\r\n" +
		"CREATE TABLE foo (id INT);\r\n" +
		"INSERT INTO foo VALUES (1);\r\n" +
		"-- +goose StatementEnd\r\n\r\n" +
		"-- +goose Down\r\n" +
		"-- +goose StatementBegin\r\n" +
		"DROP TABLE foo;\r\n" +
		"-- +goose StatementEnd\r\n"

	got, err := extractGooseUpSQL(sample)
	if err != nil {
		t.Fatalf("extractGooseUpSQL failed: %v", err)
	}
	if !strings.Contains(got, "CREATE TABLE foo (id INT);") {
		t.Fatalf("missing up statement in %q", got)
	}
	if strings.Contains(got, "DROP TABLE foo") {
		t.Fatalf("down SQL leaked into up SQL: %q", got)
	}
	if strings.Contains(got, "StatementBegin") || strings.Contains(got, "StatementEnd") {
		t.Fatalf("goose statement markers should be stripped: %q", got)
	}
}

func TestLoadActualMigrations(t *testing.T) {
	dir := filepath.Join("..", "..", "migrations")
	files, err := loadMigrationFiles(dir)
	if err != nil {
		t.Fatalf("loadMigrationFiles failed: %v", err)
	}
	if len(files) < 3 {
		t.Fatalf("expected at least 3 migration files, got %d", len(files))
	}
	if files[0].name != "202611240001_init_phase1.sql" {
		t.Fatalf("unexpected first migration: %s", files[0].name)
	}
	if files[2].name != "202611240003_replace_get203_with_get205.sql" {
		t.Fatalf("unexpected third migration: %s", files[2].name)
	}
	if files[0].version != 202611240001 {
		t.Fatalf("unexpected parsed version: %d", files[0].version)
	}
}
