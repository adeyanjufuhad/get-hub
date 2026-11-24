package server

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/adeyanjufuhad/get-hub/backend/internal/config"
)

func TestRouterAuthProvidersRoute(t *testing.T) {
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	cfg := config.Config{
		FrontendURL:     "http://localhost:3000",
		JWTSecret:       "test-secret-key-must-be-at-least-32-chars",
		AccessTokenTTL:  15 * time.Minute,
		RefreshTokenTTL: 24 * time.Hour,
		UploadDir:       t.TempDir(),
	}

	router := NewRouter(cfg, nil, logger)

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/providers", nil)
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 from /api/v1/auth/providers, got %d (%s)", rec.Code, rec.Body.String())
	}

	var payload map[string]bool
	if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if payload["google_enabled"] {
		t.Fatalf("expected google_enabled=false when client id/secret unset")
	}
}
