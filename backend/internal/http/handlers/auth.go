package handlers

import (
	"context"
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/adeyanjufuhad/get-hub/backend/internal/auth"
	"github.com/adeyanjufuhad/get-hub/backend/internal/config"
	"github.com/adeyanjufuhad/get-hub/backend/internal/db/sqlc"
	httpapi "github.com/adeyanjufuhad/get-hub/backend/internal/http"
)

var avatarPalette = []string{"#EA580C", "#0F766E", "#2563EB", "#7C3AED", "#D97706", "#059669"}

type authStore interface {
	CreateUser(ctx context.Context, arg sqlc.CreateUserParams) (sqlc.User, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (sqlc.User, error)
	GetUserByEmail(ctx context.Context, email string) (sqlc.User, error)
	GetUserByGoogleID(ctx context.Context, googleID pgtype.Text) (sqlc.User, error)
	LinkGoogleID(ctx context.Context, id uuid.UUID, googleID pgtype.Text) (sqlc.User, error)
	CreateSession(ctx context.Context, arg sqlc.CreateSessionParams) (sqlc.Session, error)
	GetActiveSessionByTokenHash(ctx context.Context, refreshTokenHash string) (sqlc.Session, error)
	RevokeSession(ctx context.Context, id uuid.UUID) error
	RevokeSessionByTokenHash(ctx context.Context, refreshTokenHash string) error
}

type googleOAuthProvider interface {
	Enabled() bool
	AuthCodeURL(state string) (string, error)
	ExchangeAndFetchUser(ctx context.Context, code string) (*auth.GoogleUserInfo, error)
}

type AuthHandler struct {
	queries   authStore
	tokens    *auth.TokenManager
	google    googleOAuthProvider
	cookieCfg auth.CookieConfig
	cfg       config.Config
}

func NewAuthHandler(queries *sqlc.Queries, tokens *auth.TokenManager, google *auth.GoogleOAuth, cfg config.Config) *AuthHandler {
	return newAuthHandlerWithDeps(queries, tokens, google, cfg)
}

func newAuthHandlerWithDeps(queries authStore, tokens *auth.TokenManager, google googleOAuthProvider, cfg config.Config) *AuthHandler {
	return &AuthHandler{
		queries:   queries,
		tokens:    tokens,
		google:    google,
		cookieCfg: auth.DefaultCookieConfig(cfg.CookieSecure, cfg.CookieDomain),
		cfg:       cfg,
	}
}

type registerRequest struct {
	FullName   string `json:"full_name"`
	Email      string `json:"email"`
	Password   string `json:"password"`
	Department string `json:"department"`
	Level      string `json:"level"`
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := httpapi.DecodeJSON(w, r, &req); err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_JSON", "Invalid request body.")
		return
	}

	req.FullName = strings.TrimSpace(req.FullName)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Department = strings.TrimSpace(req.Department)
	req.Level = strings.TrimSpace(req.Level)
	if req.Level == "" {
		req.Level = "200L"
	}

	fields := make(map[string]string)
	if nameLen := utf8.RuneCountInString(req.FullName); nameLen < 2 || nameLen > 100 {
		fields["full_name"] = "Enter your full name (2–100 characters)."
	}
	if !httpapi.IsValidEmail(req.Email) {
		fields["email"] = "Enter a valid email address."
	}
	if len(req.Password) < 8 || len(req.Password) > 128 {
		fields["password"] = "Password must be at least 8 characters."
	}
	if !httpapi.ValidDepartments[req.Department] {
		fields["department"] = "Select a valid OAU engineering department."
	}
	if !httpapi.ValidLevels[req.Level] {
		fields["level"] = "Select a valid level (e.g. 200L)."
	}
	if len(fields) > 0 {
		httpapi.WriteValidationError(w, "Please fix the highlighted fields.", fields)
		return
	}

	hash, err := auth.HashPassword(req.Password)
	if err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "WEAK_PASSWORD", err.Error())
		return
	}

	color := avatarPalette[len(req.Email)%len(avatarPalette)]
	user, err := h.queries.CreateUser(r.Context(), sqlc.CreateUserParams{
		Email:        req.Email,
		PasswordHash: pgtype.Text{String: hash, Valid: true},
		FullName:     req.FullName,
		Department:   req.Department,
		Level:        req.Level,
		Role:         "student",
		AvatarColor:  color,
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			httpapi.WriteError(w, http.StatusConflict, "EMAIL_EXISTS", "An account with this email already exists.")
			return
		}
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not create your account.")
		return
	}

	if err := h.issueSessionAndCookies(r.Context(), w, r, user); err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "SESSION_ERROR", "Account created, but could not start session.")
		return
	}

	httpapi.WriteJSON(w, http.StatusCreated, map[string]any{"user": user})
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := httpapi.DecodeJSON(w, r, &req); err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_JSON", "Invalid request body.")
		return
	}

	email := strings.TrimSpace(strings.ToLower(req.Email))
	if !httpapi.IsValidEmail(email) || req.Password == "" {
		httpapi.WriteError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Email and password are required.")
		return
	}

	user, err := h.queries.GetUserByEmail(r.Context(), email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			httpapi.WriteError(w, http.StatusUnauthorized, "INVALID_CREDENTIALS", "Incorrect email or password.")
			return
		}
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not verify credentials.")
		return
	}

	if !user.PasswordHash.Valid || user.PasswordHash.String == "" {
		httpapi.WriteError(w, http.StatusUnauthorized, "OAUTH_ONLY_ACCOUNT", "This account uses Google Sign-In. Continue with Google instead.")
		return
	}

	ok, err := auth.VerifyPassword(req.Password, user.PasswordHash.String)
	if err != nil || !ok {
		httpapi.WriteError(w, http.StatusUnauthorized, "INVALID_CREDENTIALS", "Incorrect email or password.")
		return
	}

	if err := h.issueSessionAndCookies(r.Context(), w, r, user); err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "SESSION_ERROR", "Could not start session.")
		return
	}

	httpapi.WriteJSON(w, http.StatusOK, map[string]any{"user": user})
}

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(auth.RefreshCookieName)
	if err != nil || cookie.Value == "" {
		httpapi.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Missing refresh token.")
		return
	}

	hash := auth.HashOpaqueToken(cookie.Value)
	session, err := h.queries.GetActiveSessionByTokenHash(r.Context(), hash)
	if err != nil {
		auth.ClearAuthCookies(w, h.cookieCfg)
		httpapi.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Refresh token is invalid or expired.")
		return
	}

	// Rotate refresh token: revoke old session and issue a fresh pair
	if err := h.queries.RevokeSession(r.Context(), session.ID); err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "SESSION_ERROR", "Could not rotate session.")
		return
	}

	user, err := h.queries.GetUserByID(r.Context(), session.UserID)
	if err != nil {
		auth.ClearAuthCookies(w, h.cookieCfg)
		httpapi.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "User no longer exists.")
		return
	}

	if err := h.issueSessionAndCookies(r.Context(), w, r, user); err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "SESSION_ERROR", "Could not refresh session.")
		return
	}

	httpapi.WriteJSON(w, http.StatusOK, map[string]any{"user": user})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	if cookie, err := r.Cookie(auth.RefreshCookieName); err == nil && cookie.Value != "" {
		_ = h.queries.RevokeSessionByTokenHash(r.Context(), auth.HashOpaqueToken(cookie.Value))
	}
	auth.ClearAuthCookies(w, h.cookieCfg)
	httpapi.WriteJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (h *AuthHandler) Providers(w http.ResponseWriter, r *http.Request) {
	httpapi.WriteJSON(w, http.StatusOK, map[string]any{
		"google_enabled": h.googleEnabled(),
	})
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	id, ok := auth.FromContext(r.Context())
	if !ok {
		httpapi.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication required.")
		return
	}

	user, err := h.queries.GetUserByID(r.Context(), id.UserID)
	if err != nil {
		httpapi.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "User not found.")
		return
	}

	httpapi.WriteJSON(w, http.StatusOK, map[string]any{
		"user":                 user,
		"google_oauth_enabled": h.googleEnabled(),
	})
}

func (h *AuthHandler) GoogleStart(w http.ResponseWriter, r *http.Request) {
	if !h.googleEnabled() {
		httpapi.WriteError(w, http.StatusNotImplemented, "OAUTH_DISABLED", "Google sign-in is not configured on this server.")
		return
	}

	buf := make([]byte, 24)
	if _, err := rand.Read(buf); err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not initialize OAuth state.")
		return
	}
	state := base64.RawURLEncoding.EncodeToString(buf)
	auth.SetOAuthStateCookie(w, h.cookieCfg, state)

	url, err := h.google.AuthCodeURL(state)
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "OAUTH_ERROR", "Could not build Google OAuth URL.")
		return
	}
	http.Redirect(w, r, url, http.StatusFound)
}

func (h *AuthHandler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	if !h.googleEnabled() {
		http.Redirect(w, r, h.cfg.FrontendURL+"/login?error=oauth_disabled", http.StatusFound)
		return
	}

	stateCookie, err := r.Cookie(auth.OAuthStateCookieName)
	auth.ClearOAuthStateCookie(w, h.cookieCfg)
	queryState := r.URL.Query().Get("state")
	if err != nil || stateCookie.Value == "" || queryState == "" ||
		subtle.ConstantTimeCompare([]byte(stateCookie.Value), []byte(queryState)) != 1 {
		http.Redirect(w, r, h.cfg.FrontendURL+"/login?error=oauth_state", http.StatusFound)
		return
	}

	if r.URL.Query().Get("error") != "" {
		http.Redirect(w, r, h.cfg.FrontendURL+"/login?error=oauth_cancelled", http.StatusFound)
		return
	}

	code := r.URL.Query().Get("code")
	if code == "" {
		http.Redirect(w, r, h.cfg.FrontendURL+"/login?error=oauth_cancelled", http.StatusFound)
		return
	}

	info, err := h.google.ExchangeAndFetchUser(r.Context(), code)
	if err != nil {
		http.Redirect(w, r, h.cfg.FrontendURL+"/login?error=oauth_exchange", http.StatusFound)
		return
	}
	if !info.VerifiedEmail {
		http.Redirect(w, r, h.cfg.FrontendURL+"/login?error=oauth_unverified", http.StatusFound)
		return
	}

	normalizedEmail := strings.TrimSpace(strings.ToLower(info.Email))
	user, err := h.queries.GetUserByGoogleID(r.Context(), pgtype.Text{String: info.ID, Valid: true})
	if errors.Is(err, pgx.ErrNoRows) {
		existing, emailErr := h.queries.GetUserByEmail(r.Context(), normalizedEmail)
		if emailErr == nil {
			user, err = h.queries.LinkGoogleID(r.Context(), existing.ID, pgtype.Text{String: info.ID, Valid: true})
		} else if errors.Is(emailErr, pgx.ErrNoRows) {
			name := strings.TrimSpace(info.Name)
			if name == "" {
				name = strings.Split(normalizedEmail, "@")[0]
			}
			user, err = h.queries.CreateUser(r.Context(), sqlc.CreateUserParams{
				Email:       normalizedEmail,
				GoogleID:    pgtype.Text{String: info.ID, Valid: true},
				FullName:    name,
				Department:  "Computer Science and Engineering",
				Level:       "200L",
				Role:        "student",
				AvatarColor: avatarPalette[len(normalizedEmail)%len(avatarPalette)],
			})
		} else {
			err = emailErr
		}
	}
	if err != nil {
		http.Redirect(w, r, h.cfg.FrontendURL+"/login?error=oauth_account", http.StatusFound)
		return
	}

	if err := h.issueSessionAndCookies(r.Context(), w, r, user); err != nil {
		http.Redirect(w, r, h.cfg.FrontendURL+"/login?error=session", http.StatusFound)
		return
	}

	http.Redirect(w, r, h.cfg.FrontendURL+"/dashboard", http.StatusFound)
}

func (h *AuthHandler) googleEnabled() bool {
	return h.google != nil && h.google.Enabled()
}

func (h *AuthHandler) issueSessionAndCookies(ctx context.Context, w http.ResponseWriter, r *http.Request, user sqlc.User) error {
	accessToken, err := h.tokens.IssueAccessToken(user.ID, user.Email, user.Role)
	if err != nil {
		return err
	}

	rawRefresh, hashRefresh, err := auth.GenerateRefreshToken()
	if err != nil {
		return err
	}

	_, err = h.queries.CreateSession(ctx, sqlc.CreateSessionParams{
		UserID:           user.ID,
		RefreshTokenHash: hashRefresh,
		UserAgent:        truncate(r.UserAgent(), 250),
		IpAddress:        auth.ClientIP(r),
		ExpiresAt:        time.Now().UTC().Add(h.tokens.RefreshTTL()),
	})
	if err != nil {
		return err
	}

	auth.SetAuthCookies(w, h.cookieCfg, accessToken, h.tokens.AccessTTL(), rawRefresh, h.tokens.RefreshTTL())
	return nil
}

func truncate(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max]
}
