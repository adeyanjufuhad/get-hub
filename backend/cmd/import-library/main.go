// Command import-library uploads the curated study materials listed in
// content/library/manifest.json to object storage and records them in Postgres.
//
// It is idempotent: files are identified by SHA-256, so re-running it only uploads
// new files and refreshes titles/kinds for existing ones.
//
//	go run ./cmd/import-library -root "C:\Users\User\Downloads\Second Year"
//	go run ./cmd/import-library -root "..." -dry-run
package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"mime"
	"os"
	"path/filepath"
	"strings"

	"github.com/adeyanjufuhad/get-hub/backend/internal/config"
	"github.com/adeyanjufuhad/get-hub/backend/internal/db"
	"github.com/adeyanjufuhad/get-hub/backend/internal/library"
)

type manifest struct {
	Courses []struct {
		Code     string `json:"code"`
		Title    string `json:"title"`
		Semester int16  `json:"semester"`
	} `json:"courses"`
	Items []struct {
		Course string `json:"course"`
		Path   string `json:"path"`
		Title  string `json:"title"`
		Kind   string `json:"kind"`
		Credit string `json:"credit"`
	} `json:"items"`
}

var contentTypes = map[string]string{
	".pdf":  "application/pdf",
	".ppt":  "application/vnd.ms-powerpoint",
	".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
	".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

func main() {
	if err := config.LoadDefaultDotEnv(); err != nil {
		log.Fatalf("load .env: %v", err)
	}
	rootFlag := flag.String("root", "", "Folder the manifest paths are relative to (required)")
	manifestFlag := flag.String("manifest", defaultManifestPath(), "Path to content/library/manifest.json")
	dryRun := flag.Bool("dry-run", false, "Validate the manifest and files without uploading or writing to the database")
	flag.Parse()

	if *rootFlag == "" {
		log.Fatal(`-root is required, e.g. -root "C:\Users\User\Downloads\Second Year"`)
	}

	raw, err := os.ReadFile(*manifestFlag)
	if err != nil {
		log.Fatalf("read manifest: %v", err)
	}
	var m manifest
	if err := json.Unmarshal(raw, &m); err != nil {
		log.Fatalf("parse manifest: %v", err)
	}

	courseCodes := map[string]bool{}
	for _, c := range m.Courses {
		courseCodes[c.Code] = true
	}
	for _, it := range m.Items {
		if !courseCodes[it.Course] {
			log.Fatalf("manifest item %q references unknown course %q", it.Path, it.Course)
		}
		if _, err := os.Stat(filepath.Join(*rootFlag, filepath.FromSlash(it.Path))); err != nil {
			log.Fatalf("manifest item %q: %v", it.Path, err)
		}
	}
	fmt.Printf("manifest ok: %d courses, %d files\n", len(m.Courses), len(m.Items))
	if *dryRun {
		return
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}
	storage, err := library.NewStorage(cfg.LibraryStorage())
	if err != nil {
		log.Fatalf("storage: %v (set LIBRARY_S3_* in backend/.env)", err)
	}

	ctx := context.Background()
	pool, err := db.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	defer pool.Close()
	repo := library.NewRepo(pool)

	for _, c := range m.Courses {
		if err := repo.UpsertCourse(ctx, c.Code, c.Title, c.Semester); err != nil {
			log.Fatalf("upsert course %s: %v", c.Code, err)
		}
	}

	var uploaded, added, refreshed int
	var uploadedBytes int64
	for i, it := range m.Items {
		full := filepath.Join(*rootFlag, filepath.FromSlash(it.Path))
		sum, size, err := hashFile(full)
		if err != nil {
			log.Fatalf("hash %s: %v", it.Path, err)
		}
		ext := strings.ToLower(filepath.Ext(full))
		contentType := contentTypes[ext]
		if contentType == "" {
			contentType = mime.TypeByExtension(ext)
		}
		if contentType == "" {
			contentType = "application/octet-stream"
		}
		key := fmt.Sprintf("materials/%s/%s%s", strings.ToLower(strings.ReplaceAll(it.Course, " ", "-")), sum[:16], ext)

		var exists bool
		for attempt := 1; attempt <= 3; attempt++ {
			exists, err = storage.Exists(ctx, key)
			if err == nil {
				break
			}
			if attempt == 3 {
				log.Fatalf("check %s: %v", key, err)
			}
		}
		if !exists {
			for attempt := 1; attempt <= 3; attempt++ {
				f, openErr := os.Open(full)
				if openErr != nil {
					log.Fatalf("open %s: %v", it.Path, openErr)
				}
				err = storage.Put(ctx, key, f, size, contentType)
				f.Close()
				if err == nil {
					break
				}
				if attempt == 3 {
					log.Fatalf("upload %s: %v", it.Path, err)
				}
			}
			uploaded++
			uploadedBytes += size
		}

		inserted, err := repo.UpsertMaterial(ctx, library.NewMaterial{
			CourseCode:  it.Course,
			Title:       it.Title,
			Kind:        it.Kind,
			Credit:      it.Credit,
			FileName:    filepath.Base(full),
			ContentType: contentType,
			SizeBytes:   size,
			SHA256:      sum,
			ObjectKey:   key,
		})
		if err != nil {
			log.Fatalf("record %s: %v", it.Path, err)
		}
		if inserted {
			added++
		} else {
			refreshed++
		}
		state := "kept"
		if !exists {
			state = "uploaded"
		}
		fmt.Printf("[%3d/%d] %-8s %s — %s (%.1f MB)\n", i+1, len(m.Items), state, it.Course, it.Title, float64(size)/1048576)
	}

	fmt.Printf("done: %d uploaded (%.1f MB), %d new catalogue rows, %d refreshed\n",
		uploaded, float64(uploadedBytes)/1048576, added, refreshed)
}

func hashFile(path string) (string, int64, error) {
	f, err := os.Open(path)
	if err != nil {
		return "", 0, err
	}
	defer f.Close()
	h := sha256.New()
	n, err := io.Copy(h, f)
	if err != nil {
		return "", 0, err
	}
	return hex.EncodeToString(h.Sum(nil)), n, nil
}

func defaultManifestPath() string {
	for _, p := range []string{"../content/library/manifest.json", "content/library/manifest.json"} {
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}
	return "../content/library/manifest.json"
}
