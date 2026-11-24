package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/adeyanjufuhad/get-hub/backend/internal/config"
	"github.com/adeyanjufuhad/get-hub/backend/internal/db"
)

func main() {
	if err := config.LoadDefaultDotEnv(); err != nil {
		log.Fatalf("load .env: %v", err)
	}

	dirFlag := flag.String("dir", defaultMigrationsDir(), "Path to SQL migrations directory")
	statusFlag := flag.Bool("status", false, "Print migration status without applying pending migrations")
	verifyFlag := flag.Bool("verify", false, "Verify seeded courses/topics/questions counts after running")
	flag.Parse()

	dbURL := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	if dbURL == "" || strings.Contains(dbURL, "ep-example-pooler") {
		log.Fatal("error: DATABASE_URL is not configured (or still uses the ep-example-pooler placeholder). Set your Neon Postgres connection string in backend/.env or environment variables.")
	}

	files, err := loadMigrationFiles(*dirFlag)
	if err != nil {
		log.Fatalf("read migrations in %s: %v", *dirFlag, err)
	}
	if len(files) == 0 {
		log.Fatalf("no .sql migration files found in %s", *dirFlag)
	}

	ctx := context.Background()
	pool, err := db.NewPool(ctx, dbURL)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	defer pool.Close()

	if err := ensureMigrationsTable(ctx, pool); err != nil {
		log.Fatalf("ensure schema_migrations table: %v", err)
	}

	applied, err := loadAppliedMigrations(ctx, pool, files)
	if err != nil {
		log.Fatalf("check applied migrations: %v", err)
	}

	if *statusFlag {
		for _, f := range files {
			state := "pending"
			if applied[f.name] {
				state = "applied"
			}
			fmt.Printf("%-8s %s\n", state, f.name)
		}
		return
	}

	appliedCount := 0
	for _, f := range files {
		if applied[f.name] {
			fmt.Printf("skip    %s (already applied)\n", f.name)
			continue
		}

		if err := applyMigration(ctx, pool, f); err != nil {
			log.Fatalf("apply migration %s: %v", f.name, err)
		}
		fmt.Printf("applied %s\n", f.name)
		appliedCount++
	}

	fmt.Printf("migrations complete (%d applied, %d total).\n", appliedCount, len(files))

	if *verifyFlag {
		if err := verifySchemaAndSeed(ctx, pool); err != nil {
			log.Fatalf("verify database: %v", err)
		}
	}
}

type migrationFile struct {
	name    string
	version int64
	upSQL   string
}

func defaultMigrationsDir() string {
	for _, candidate := range []string{"migrations", "backend/migrations"} {
		info, err := os.Stat(candidate)
		if err == nil && info.IsDir() {
			return candidate
		}
	}
	return "migrations"
}

func loadMigrationFiles(dir string) ([]migrationFile, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	var names []string
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}
		names = append(names, entry.Name())
	}
	sort.Strings(names)

	files := make([]migrationFile, 0, len(names))
	for _, name := range names {
		raw, err := os.ReadFile(filepath.Join(dir, name))
		if err != nil {
			return nil, fmt.Errorf("read %s: %w", name, err)
		}
		upSQL, err := extractGooseUpSQL(string(raw))
		if err != nil {
			return nil, fmt.Errorf("parse %s: %w", name, err)
		}
		files = append(files, migrationFile{
			name:    name,
			version: parseMigrationPrefix(name),
			upSQL:   upSQL,
		})
	}
	return files, nil
}

func parseMigrationPrefix(filename string) int64 {
	prefix, _, _ := strings.Cut(filename, "_")
	n, err := strconv.ParseInt(prefix, 10, 64)
	if err != nil {
		return 0
	}
	return n
}

// extractGooseUpSQL extracts the `-- +goose Up` section of a goose SQL migration,
// removing goose directive comments (`-- +goose StatementBegin/End`) and stopping at `-- +goose Down`.
func extractGooseUpSQL(content string) (string, error) {
	normalized := strings.ReplaceAll(content, "\r\n", "\n")
	lines := strings.Split(normalized, "\n")

	inUp := false
	foundUp := false
	var out []string

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		switch trimmed {
		case "-- +goose Up":
			inUp = true
			foundUp = true
			continue
		case "-- +goose Down":
			inUp = false
			continue
		case "-- +goose StatementBegin", "-- +goose StatementEnd":
			continue
		}
		if inUp {
			out = append(out, line)
		}
	}

	if !foundUp {
		return "", errors.New("missing '-- +goose Up' directive")
	}

	sql := strings.TrimSpace(strings.Join(out, "\n"))
	if sql == "" {
		return "", errors.New("empty '-- +goose Up' section")
	}
	return sql, nil
}

func ensureMigrationsTable(ctx context.Context, pool *pgxpool.Pool) error {
	const ddl = `
CREATE TABLE IF NOT EXISTS schema_migrations (
	version TEXT PRIMARY KEY,
	applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`
	_, err := pool.Exec(ctx, ddl)
	return err
}

func loadAppliedMigrations(ctx context.Context, pool *pgxpool.Pool, files []migrationFile) (map[string]bool, error) {
	applied := make(map[string]bool)

	rows, err := pool.Query(ctx, `SELECT version FROM schema_migrations`)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var version string
		if err := rows.Scan(&version); err != nil {
			rows.Close()
			return nil, err
		}
		applied[version] = true
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return nil, err
	}
	rows.Close()

	// Interoperate cleanly if goose was previously run against this database.
	var gooseExists bool
	if err := pool.QueryRow(ctx, `SELECT to_regclass('public.goose_db_version') IS NOT NULL`).Scan(&gooseExists); err != nil {
		return nil, err
	}
	if gooseExists {
		gooseRows, err := pool.Query(ctx, `SELECT version_id FROM goose_db_version WHERE is_applied = TRUE`)
		if err != nil {
			return nil, err
		}
		gooseVersions := make(map[int64]bool)
		for gooseRows.Next() {
			var vid int64
			if err := gooseRows.Scan(&vid); err != nil {
				gooseRows.Close()
				return nil, err
			}
			gooseVersions[vid] = true
		}
		if err := gooseRows.Err(); err != nil {
			gooseRows.Close()
			return nil, err
		}
		gooseRows.Close()

		for _, f := range files {
			if f.version > 0 && gooseVersions[f.version] && !applied[f.name] {
				if _, err := pool.Exec(ctx, `INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT (version) DO NOTHING`, f.name); err != nil {
					return nil, err
				}
				applied[f.name] = true
			}
		}
	}

	return applied, nil
}

func applyMigration(ctx context.Context, pool *pgxpool.Pool, f migrationFile) error {
	tx, err := pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if _, err := tx.Exec(ctx, f.upSQL); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, `INSERT INTO schema_migrations (version) VALUES ($1)`, f.name); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func verifySchemaAndSeed(ctx context.Context, pool *pgxpool.Pool) error {
	var coursesCount, topicsCount, questionsCount int
	if err := pool.QueryRow(ctx, `SELECT COUNT(*) FROM courses`).Scan(&coursesCount); err != nil {
		return err
	}
	if err := pool.QueryRow(ctx, `SELECT COUNT(*) FROM topics`).Scan(&topicsCount); err != nil {
		return err
	}
	if err := pool.QueryRow(ctx, `SELECT COUNT(*) FROM questions`).Scan(&questionsCount); err != nil {
		return err
	}

	rows, err := pool.Query(ctx, `SELECT code, slug, title FROM courses ORDER BY display_order ASC`)
	if err != nil {
		return err
	}
	defer rows.Close()

	fmt.Printf("verified: courses=%d topics=%d questions=%d\n", coursesCount, topicsCount, questionsCount)
	for rows.Next() {
		var code, slug, title string
		if err := rows.Scan(&code, &slug, &title); err != nil {
			return err
		}
		fmt.Printf("  - %s (%s): %s\n", code, slug, title)
	}
	return rows.Err()
}
