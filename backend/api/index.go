package handler

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
	"sync"

	"github.com/adeyanjufuhad/get-hub/backend/internal/config"
	"github.com/adeyanjufuhad/get-hub/backend/internal/db"
	"github.com/adeyanjufuhad/get-hub/backend/internal/server"
)

var (
	initOnce sync.Once
	router   http.Handler
	initErr  error
)

func initHandler() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	cfg, err := config.Load()
	if err != nil {
		logger.Error("configuration error", "error", err)
		initErr = err
		return
	}

	pool, err := db.NewPool(context.Background(), cfg.DatabaseURL)
	if err != nil {
		logger.Error("database connection failed", "error", err)
		initErr = err
		return
	}

	router = server.NewRouter(cfg, pool, logger)
	logger.Info("GET Hub serverless API initialized", "env", cfg.AppEnv, "frontend", cfg.FrontendURL)
}

// Handler is the Vercel Go Serverless Function entrypoint for all API routes.
func Handler(w http.ResponseWriter, r *http.Request) {
	initOnce.Do(initHandler)
	if initErr != nil || router == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"error": map[string]string{
				"code":    "BACKEND_INIT_FAILED",
				"message": "API backend is starting or misconfigured.",
			},
		})
		return
	}
	router.ServeHTTP(w, r)
}
