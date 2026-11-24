package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

// Config holds all runtime settings loaded from environment variables.
type Config struct {
	Port                string
	AppEnv              string
	FrontendURL         string
	APIPublicURL        string
	DatabaseURL         string
	JWTSecret           string
	AccessTokenTTL      time.Duration
	RefreshTokenTTL     time.Duration
	CookieSecure        bool
	CookieDomain        string
	GoogleClientID      string
	GoogleClientSecret  string
	GoogleRedirectURL   string
	IncludeDraftContent bool
	EnforcePaidGating   bool
	UploadDir           string
}

// Load parses and validates environment configuration.
func Load() (Config, error) {
	port := getEnv("PORT", "8080")
	appEnv := getEnv("APP_ENV", "development")
	frontendURL := strings.TrimRight(getEnv("FRONTEND_URL", "http://localhost:3000"), "/")
	apiPublicURL := strings.TrimRight(getEnv("API_PUBLIC_URL", "http://localhost:"+port), "/")

	dbURL := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	if dbURL == "" {
		return Config{}, fmt.Errorf("DATABASE_URL is required")
	}

	jwtSecret := strings.TrimSpace(os.Getenv("JWT_SECRET"))
	if len(jwtSecret) < 32 {
		return Config{}, fmt.Errorf("JWT_SECRET must be at least 32 characters")
	}

	accessMins := getEnvInt("ACCESS_TOKEN_TTL_MINUTES", 15)
	refreshDays := getEnvInt("REFRESH_TOKEN_TTL_DAYS", 30)
	cookieSecure := getEnvBool("COOKIE_SECURE", appEnv == "production")

	cfg := Config{
		Port:               port,
		AppEnv:             appEnv,
		FrontendURL:        frontendURL,
		APIPublicURL:       apiPublicURL,
		DatabaseURL:        dbURL,
		JWTSecret:          jwtSecret,
		AccessTokenTTL:     time.Duration(accessMins) * time.Minute,
		RefreshTokenTTL:    time.Duration(refreshDays) * 24 * time.Hour,
		CookieSecure:       cookieSecure,
		CookieDomain:       strings.TrimSpace(os.Getenv("COOKIE_DOMAIN")),
		GoogleClientID:     strings.TrimSpace(os.Getenv("GOOGLE_CLIENT_ID")),
		GoogleClientSecret: strings.TrimSpace(os.Getenv("GOOGLE_CLIENT_SECRET")),
		// Default to the frontend origin: Next.js proxies /api/v1/* to the API, so the
		// OAuth state cookie and auth cookies all stay first-party on the site domain.
		GoogleRedirectURL:   getEnv("GOOGLE_REDIRECT_URL", frontendURL+"/api/v1/auth/google/callback"),
		IncludeDraftContent: getEnvBool("INCLUDE_DRAFT_CONTENT", appEnv != "production"),
		EnforcePaidGating:   getEnvBool("ENFORCE_PAID_GATING", false),
		UploadDir:           getEnv("UPLOAD_DIR", "./uploads"),
	}

	return cfg, nil
}

func (c Config) GoogleOAuthEnabled() bool {
	return c.GoogleClientID != "" && c.GoogleClientSecret != ""
}

func getEnv(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}
	n, err := strconv.Atoi(v)
	if err != nil || n <= 0 {
		return fallback
	}
	return n
}

func getEnvBool(key string, fallback bool) bool {
	v := strings.TrimSpace(strings.ToLower(os.Getenv(key)))
	if v == "" {
		return fallback
	}
	switch v {
	case "1", "true", "yes", "on":
		return true
	case "0", "false", "no", "off":
		return false
	default:
		return fallback
	}
}
