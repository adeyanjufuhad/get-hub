package questions

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/google/uuid"
)

const MaxUploadBytes = 512 * 1024 // 512 KB keeps assets crisp & fast on 3G

var (
	ErrUnsupportedMediaType = errors.New("only SVG, PNG, and WebP images are allowed")
	ErrFileTooLarge         = errors.New("image exceeds 512 KB limit")
	ErrUnsafeSVG            = errors.New("SVG contains disallowed script or event handler content")

	unsafeSVGPattern = regexp.MustCompile(`(?i)(<\s*script|on[a-z]+\s*=|javascript:|<\s*foreignObject|<\s*iframe)`)
)

// SaveQuestionImage validates and persists an uploaded SVG, PNG, or WebP file and returns its relative URL path.
func SaveQuestionImage(uploadDir string, filename string, r io.Reader) (string, error) {
	limited := io.LimitReader(r, MaxUploadBytes+1)
	data, err := io.ReadAll(limited)
	if err != nil {
		return "", fmt.Errorf("read upload: %w", err)
	}
	if len(data) == 0 {
		return "", errors.New("empty file")
	}
	if len(data) > MaxUploadBytes {
		return "", ErrFileTooLarge
	}

	ext, err := detectAllowedImageExt(filename, data)
	if err != nil {
		return "", err
	}

	if ext == ".svg" {
		if unsafeSVGPattern.Match(data) {
			return "", ErrUnsafeSVG
		}
	}

	if err := os.MkdirAll(uploadDir, 0o755); err != nil {
		return "", fmt.Errorf("create upload dir: %w", err)
	}

	storedName := uuid.New().String() + ext
	dest := filepath.Join(uploadDir, storedName)
	if err := os.WriteFile(dest, data, 0o644); err != nil {
		return "", fmt.Errorf("write upload file: %w", err)
	}

	return "/uploads/" + storedName, nil
}

func detectAllowedImageExt(filename string, data []byte) (string, error) {
	lowerExt := strings.ToLower(filepath.Ext(filename))
	mime := http.DetectContentType(data)

	switch {
	case mime == "image/png":
		return ".png", nil
	case mime == "image/webp":
		return ".webp", nil
	case lowerExt == ".svg" && isSVGBytes(data):
		return ".svg", nil
	default:
		return "", ErrUnsupportedMediaType
	}
}

func isSVGBytes(data []byte) bool {
	trimmed := bytes.TrimSpace(data)
	prefix := strings.ToLower(string(trimmed[:min(len(trimmed), 256)]))
	return strings.Contains(prefix, "<svg")
}
