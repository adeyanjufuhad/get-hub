package server

import (
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/time/rate"

	"github.com/adeyanjufuhad/get-hub/backend/internal/access"
	"github.com/adeyanjufuhad/get-hub/backend/internal/auth"
	"github.com/adeyanjufuhad/get-hub/backend/internal/config"
	"github.com/adeyanjufuhad/get-hub/backend/internal/db/sqlc"
	"github.com/adeyanjufuhad/get-hub/backend/internal/http/handlers"
)

// NewRouter constructs the chi HTTP router with CORS, logging, rate limiting, auth, and access middleware.
func NewRouter(cfg config.Config, pool *pgxpool.Pool, logger *slog.Logger) http.Handler {
	queries := sqlc.New(pool)
	tokenMgr := auth.NewTokenManager(cfg.JWTSecret, cfg.AccessTokenTTL, cfg.RefreshTokenTTL)
	googleOAuth := auth.NewGoogleOAuth(cfg.GoogleClientID, cfg.GoogleClientSecret, cfg.GoogleRedirectURL)
	policy := access.Policy{EnforcePaid: cfg.EnforcePaidGating}

	// Rate limit auth endpoints: ~20 req/min with burst 10 per IP
	authLimiter := auth.NewIPRateLimiter(rate.Every(3*time.Second), 10)

	healthH := handlers.NewHealthHandler(pool)
	authH := handlers.NewAuthHandler(queries, tokenMgr, googleOAuth, cfg)
	coursesH := handlers.NewCoursesHandler(queries, cfg, policy)
	practiceH := handlers.NewPracticeHandler(queries, cfg, policy)
	examsH := handlers.NewExamsHandler(queries, cfg, policy)
	dashboardH := handlers.NewDashboardHandler(queries, cfg)
	adminH := handlers.NewAdminHandler(queries, cfg)

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))
	r.Use(requestLogger(logger))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{cfg.FrontendURL},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Requested-With"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Healthcheck
	r.Get("/healthz", healthH.Check)

	// Safe static upload serving for admin-uploaded SVG/PNG/WebP assets
	fileServer := http.StripPrefix("/uploads/", http.FileServer(http.Dir(cfg.UploadDir)))
	r.Get("/uploads/*", func(w http.ResponseWriter, req *http.Request) {
		if strings.Contains(req.URL.Path, "..") {
			http.NotFound(w, req)
			return
		}
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox")
		w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		fileServer.ServeHTTP(w, req)
	})

	r.Route("/api/v1", func(r chi.Router) {
		// Auth endpoints (rate-limited)
		r.Route("/auth", func(r chi.Router) {
			r.Get("/providers", authH.Providers)
			r.With(authLimiter.Middleware).Post("/register", authH.Register)
			r.With(authLimiter.Middleware).Post("/login", authH.Login)
			r.With(authLimiter.Middleware).Post("/refresh", authH.Refresh)
			r.Post("/logout", authH.Logout)
			r.With(authLimiter.Middleware).Get("/google/start", authH.GoogleStart)
			r.With(authLimiter.Middleware).Get("/google/callback", authH.GoogleCallback)
			r.With(auth.RequireAuth(tokenMgr)).Get("/me", authH.Me)
		})

		// Public or optionally-authenticated course catalogue
		r.With(auth.OptionalAuth(tokenMgr)).Get("/courses", coursesH.List)
		r.With(auth.OptionalAuth(tokenMgr)).Get("/courses/{slug}", coursesH.GetBySlug)

		// Authenticated student study routes
		r.Group(func(r chi.Router) {
			r.Use(auth.RequireAuth(tokenMgr))

			r.Get("/dashboard", dashboardH.Get)

			// Topic progress & practice (gated through single access.CanAccess middleware)
			r.With(access.RequireItemAccess(policy, coursesH.TopicAccessLoader)).
				Post("/topics/{topicId}/view", coursesH.MarkTopicViewed)
			r.With(access.RequireItemAccess(policy, coursesH.TopicAccessLoader)).
				Post("/topics/{topicId}/complete", coursesH.SetTopicCompleted)
			r.With(access.RequireItemAccess(policy, coursesH.TopicAccessLoader)).
				Get("/topics/{topicId}/questions", practiceH.ListTopicQuestions)

			r.With(access.RequireItemAccess(policy, practiceH.QuestionAccessLoader)).
				Post("/questions/{questionId}/attempt", practiceH.SubmitAttempt)

			// Mock exams (owner-isolated inside handler queries)
			r.Post("/courses/{slug}/mock-exams", examsH.Start)
			r.Get("/mock-exams", examsH.ListMine)
			r.Get("/mock-exams/{examId}", examsH.GetByID)
			r.Post("/mock-exams/{examId}/submit", examsH.Submit)
		})

		// Admin-only routes
		r.Route("/admin", func(r chi.Router) {
			r.Use(auth.RequireAuth(tokenMgr))
			r.Use(auth.RequireAdmin)

			r.Get("/metadata", adminH.ListMetadata)
			r.Get("/questions", adminH.ListQuestions)
			r.Post("/questions", adminH.CreateQuestion)
			r.Put("/questions/{questionId}", adminH.UpdateQuestion)
			r.Patch("/questions/{questionId}/status", adminH.UpdateStatus)
			r.Delete("/questions/{questionId}", adminH.DeleteQuestion)
			r.Post("/uploads", adminH.UploadImage)
		})
	})

	return r
}

func requestLogger(logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
			next.ServeHTTP(ww, r)
			logger.Info("http_request",
				"method", r.Method,
				"path", r.URL.Path,
				"status", ww.Status(),
				"bytes", ww.BytesWritten(),
				"duration_ms", time.Since(start).Milliseconds(),
				"request_id", middleware.GetReqID(r.Context()),
			)
		})
	}
}
