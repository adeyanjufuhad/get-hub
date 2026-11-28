package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/adeyanjufuhad/get-hub/backend/internal/auth"
	"github.com/adeyanjufuhad/get-hub/backend/internal/config"
	"github.com/adeyanjufuhad/get-hub/backend/internal/db/sqlc"
)

type memoryAuthStore struct {
	usersByID map[uuid.UUID]sqlc.User
	sessions  map[string]sqlc.Session
}

func newMemoryAuthStore() *memoryAuthStore {
	return &memoryAuthStore{
		usersByID: make(map[uuid.UUID]sqlc.User),
		sessions:  make(map[string]sqlc.Session),
	}
}

func (m *memoryAuthStore) CreateUser(_ context.Context, arg sqlc.CreateUserParams) (sqlc.User, error) {
	for _, existing := range m.usersByID {
		if strings.EqualFold(existing.Email, arg.Email) {
			return sqlc.User{}, &pgconn.PgError{Code: "23505"}
		}
	}
	now := time.Now().UTC()
	u := sqlc.User{
		ID:           uuid.New(),
		Email:        strings.ToLower(arg.Email),
		PasswordHash: arg.PasswordHash,
		GoogleID:     arg.GoogleID,
		FullName:     arg.FullName,
		Department:   arg.Department,
		Level:        arg.Level,
		Role:         arg.Role,
		AvatarColor:  arg.AvatarColor,
		CreatedAt:    now,
		UpdatedAt:    now,
	}
	m.usersByID[u.ID] = u
	return u, nil
}

func (m *memoryAuthStore) GetUserByID(_ context.Context, id uuid.UUID) (sqlc.User, error) {
	u, ok := m.usersByID[id]
	if !ok {
		return sqlc.User{}, pgx.ErrNoRows
	}
	return u, nil
}

func (m *memoryAuthStore) GetUserByEmail(_ context.Context, email string) (sqlc.User, error) {
	for _, u := range m.usersByID {
		if strings.EqualFold(u.Email, email) {
			return u, nil
		}
	}
	return sqlc.User{}, pgx.ErrNoRows
}

func (m *memoryAuthStore) GetUserByGoogleID(_ context.Context, googleID pgtype.Text) (sqlc.User, error) {
	if !googleID.Valid {
		return sqlc.User{}, pgx.ErrNoRows
	}
	for _, u := range m.usersByID {
		if u.GoogleID.Valid && u.GoogleID.String == googleID.String {
			return u, nil
		}
	}
	return sqlc.User{}, pgx.ErrNoRows
}

func (m *memoryAuthStore) LinkGoogleID(_ context.Context, id uuid.UUID, googleID pgtype.Text) (sqlc.User, error) {
	u, ok := m.usersByID[id]
	if !ok {
		return sqlc.User{}, pgx.ErrNoRows
	}
	u.GoogleID = googleID
	u.UpdatedAt = time.Now().UTC()
	m.usersByID[id] = u
	return u, nil
}

func (m *memoryAuthStore) UpdateUserProfile(_ context.Context, arg sqlc.UpdateUserProfileParams) (sqlc.User, error) {
	u, ok := m.usersByID[arg.ID]
	if !ok {
		return sqlc.User{}, pgx.ErrNoRows
	}
	u.FullName = arg.FullName
	u.Department = arg.Department
	u.Level = arg.Level
	u.UpdatedAt = time.Now().UTC()
	m.usersByID[arg.ID] = u
	return u, nil
}

func (m *memoryAuthStore) CreateSession(_ context.Context, arg sqlc.CreateSessionParams) (sqlc.Session, error) {
	s := sqlc.Session{
		ID:               uuid.New(),
		UserID:           arg.UserID,
		RefreshTokenHash: arg.RefreshTokenHash,
		UserAgent:        arg.UserAgent,
		IpAddress:        arg.IpAddress,
		ExpiresAt:        arg.ExpiresAt,
		CreatedAt:        time.Now().UTC(),
	}
	m.sessions[arg.RefreshTokenHash] = s
	return s, nil
}

func (m *memoryAuthStore) GetActiveSessionByTokenHash(_ context.Context, refreshTokenHash string) (sqlc.Session, error) {
	s, ok := m.sessions[refreshTokenHash]
	if !ok || s.RevokedAt.Valid || !s.ExpiresAt.After(time.Now().UTC()) {
		return sqlc.Session{}, pgx.ErrNoRows
	}
	return s, nil
}

func (m *memoryAuthStore) RevokeSession(_ context.Context, id uuid.UUID) error {
	for hash, s := range m.sessions {
		if s.ID == id && !s.RevokedAt.Valid {
			s.RevokedAt = pgtype.Timestamptz{Time: time.Now().UTC(), Valid: true}
			m.sessions[hash] = s
		}
	}
	return nil
}

func (m *memoryAuthStore) RevokeSessionByTokenHash(_ context.Context, refreshTokenHash string) error {
	if s, ok := m.sessions[refreshTokenHash]; ok && !s.RevokedAt.Valid {
		s.RevokedAt = pgtype.Timestamptz{Time: time.Now().UTC(), Valid: true}
		m.sessions[refreshTokenHash] = s
	}
	return nil
}

type stubGoogleOAuth struct {
	enabled bool
	user    *auth.GoogleUserInfo
	err     error
}

func (s *stubGoogleOAuth) Enabled() bool {
	return s.enabled
}

func (s *stubGoogleOAuth) AuthCodeURL(state string) (string, error) {
	if !s.enabled {
		return "", auth.ErrGoogleOAuthDisabled
	}
	return "https://accounts.google.com/o/oauth2/v2/auth?state=" + url.QueryEscape(state), nil
}

func (s *stubGoogleOAuth) ExchangeAndFetchUser(_ context.Context, code string) (*auth.GoogleUserInfo, error) {
	if s.err != nil {
		return nil, s.err
	}
	if code == "" {
		return nil, errors.New("missing code")
	}
	return s.user, nil
}

func newTestAuthHandler(store *memoryAuthStore, google googleOAuthProvider) (*AuthHandler, *auth.TokenManager) {
	cfg := config.Config{
		FrontendURL:     "http://localhost:3000",
		JWTSecret:       "test-secret-key-must-be-at-least-32-chars",
		AccessTokenTTL:  15 * time.Minute,
		RefreshTokenTTL: 24 * time.Hour,
		CookieSecure:    false,
	}
	tm := auth.NewTokenManager(cfg.JWTSecret, cfg.AccessTokenTTL, cfg.RefreshTokenTTL)
	return newAuthHandlerWithDeps(store, tm, google, cfg), tm
}

func findCookie(cookies []*http.Cookie, name string) *http.Cookie {
	for _, c := range cookies {
		if c.Name == name {
			return c
		}
	}
	return nil
}

func TestAuthProvidersEndpoint(t *testing.T) {
	store := newMemoryAuthStore()

	hDisabled, _ := newTestAuthHandler(store, &stubGoogleOAuth{enabled: false})
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/providers", nil)
	hDisabled.Providers(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	var body map[string]bool
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if body["google_enabled"] {
		t.Fatalf("expected google_enabled=false")
	}

	hEnabled, _ := newTestAuthHandler(store, &stubGoogleOAuth{enabled: true})
	rec = httptest.NewRecorder()
	hEnabled.Providers(rec, httptest.NewRequest(http.MethodGet, "/api/v1/auth/providers", nil))
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if !body["google_enabled"] {
		t.Fatalf("expected google_enabled=true")
	}
}

func TestEmailAuthSequenceRegisterLoginMeRefreshLogout(t *testing.T) {
	store := newMemoryAuthStore()
	h, tm := newTestAuthHandler(store, &stubGoogleOAuth{enabled: false})

	// 1. Validation failure on register
	badBody := `{"full_name":"A","email":"not-an-email","password":"123","department":"Unknown","level":"900L"}`
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", strings.NewReader(badBody))
	h.Register(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 on invalid register payload, got %d", rec.Code)
	}
	var valErr struct {
		Error struct {
			Code   string            `json:"code"`
			Fields map[string]string `json:"fields"`
		} `json:"error"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &valErr); err != nil {
		t.Fatalf("decode validation error: %v", err)
	}
	if valErr.Error.Code != "VALIDATION_ERROR" || len(valErr.Error.Fields) != 5 {
		t.Fatalf("unexpected validation payload: %+v", valErr)
	}

	// 2. Successful register
	regPayload, _ := json.Marshal(map[string]string{
		"full_name":  "Fuhad Adeyanju",
		"email":      "Fuhad@oauife.edu.ng",
		"password":   "StrongPass123!",
		"department": "Computer Science and Engineering",
		"level":      "200L",
	})
	rec = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewReader(regPayload))
	h.Register(rec, req)
	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201 on register, got %d (%s)", rec.Code, rec.Body.String())
	}

	regCookies := rec.Result().Cookies()
	accessCookie := findCookie(regCookies, auth.AccessCookieName)
	refreshCookie := findCookie(regCookies, auth.RefreshCookieName)
	if accessCookie == nil || refreshCookie == nil {
		t.Fatalf("expected access and refresh cookies on register")
	}

	// 3. Duplicate email -> 409
	rec = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewReader(regPayload))
	h.Register(rec, req)
	if rec.Code != http.StatusConflict {
		t.Fatalf("expected 409 on duplicate email, got %d", rec.Code)
	}

	// 4. Wrong password -> 401
	rec = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", strings.NewReader(`{"email":"fuhad@oauife.edu.ng","password":"wrong-password"}`))
	h.Login(rec, req)
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 on wrong password, got %d", rec.Code)
	}

	// 5. Valid login -> 200 + cookies
	rec = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", strings.NewReader(`{"email":"fuhad@oauife.edu.ng","password":"StrongPass123!"}`))
	h.Login(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on login, got %d (%s)", rec.Code, rec.Body.String())
	}
	loginCookies := rec.Result().Cookies()
	loginAccess := findCookie(loginCookies, auth.AccessCookieName)
	loginRefresh := findCookie(loginCookies, auth.RefreshCookieName)
	if loginAccess == nil || loginRefresh == nil {
		t.Fatalf("expected cookies on login")
	}

	// 6. GET /me with RequireAuth middleware
	meHandler := auth.RequireAuth(tm)(http.HandlerFunc(h.Me))
	rec = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
	req.AddCookie(loginAccess)
	meHandler.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on /me, got %d", rec.Code)
	}
	var meResp struct {
		User               sqlc.User `json:"user"`
		GoogleOAuthEnabled bool      `json:"google_oauth_enabled"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &meResp); err != nil {
		t.Fatalf("decode /me: %v", err)
	}
	if meResp.User.Email != "fuhad@oauife.edu.ng" || meResp.GoogleOAuthEnabled {
		t.Fatalf("unexpected /me payload: %+v", meResp)
	}

	// 7. Refresh rotates token and revokes old refresh token
	rec = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodPost, "/api/v1/auth/refresh", nil)
	req.AddCookie(loginRefresh)
	h.Refresh(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on refresh, got %d (%s)", rec.Code, rec.Body.String())
	}
	rotatedRefresh := findCookie(rec.Result().Cookies(), auth.RefreshCookieName)
	if rotatedRefresh == nil || rotatedRefresh.Value == loginRefresh.Value {
		t.Fatalf("expected rotated refresh cookie")
	}

	// Reusing old refresh token must fail
	rec = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodPost, "/api/v1/auth/refresh", nil)
	req.AddCookie(loginRefresh)
	h.Refresh(rec, req)
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 when reusing rotated refresh token, got %d", rec.Code)
	}

	// 8. Logout revokes active session and clears cookies
	rec = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodPost, "/api/v1/auth/logout", nil)
	req.AddCookie(rotatedRefresh)
	h.Logout(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on logout, got %d", rec.Code)
	}

	rec = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodPost, "/api/v1/auth/refresh", nil)
	req.AddCookie(rotatedRefresh)
	h.Refresh(rec, req)
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 after logout, got %d", rec.Code)
	}
}

func TestGoogleOAuthFlowStateLinkingAndNewUser(t *testing.T) {
	store := newMemoryAuthStore()
	google := &stubGoogleOAuth{
		enabled: true,
		user: &auth.GoogleUserInfo{
			ID:            "google-sub-123",
			Email:         "student@oauife.edu.ng",
			VerifiedEmail: true,
			Name:          "Ada OAU",
		},
	}
	h, _ := newTestAuthHandler(store, google)

	// 1. Disabled returns 501
	hDisabled, _ := newTestAuthHandler(store, &stubGoogleOAuth{enabled: false})
	rec := httptest.NewRecorder()
	hDisabled.GoogleStart(rec, httptest.NewRequest(http.MethodGet, "/api/v1/auth/google/start", nil))
	if rec.Code != http.StatusNotImplemented {
		t.Fatalf("expected 501 when Google OAuth disabled, got %d", rec.Code)
	}

	// 2. Start sets state cookie and redirects to Google
	rec = httptest.NewRecorder()
	h.GoogleStart(rec, httptest.NewRequest(http.MethodGet, "/api/v1/auth/google/start", nil))
	if rec.Code != http.StatusFound {
		t.Fatalf("expected 302 from GoogleStart, got %d", rec.Code)
	}
	stateCookie := findCookie(rec.Result().Cookies(), auth.OAuthStateCookieName)
	if stateCookie == nil || stateCookie.Value == "" || stateCookie.Path != "/api/v1/auth/google" {
		t.Fatalf("unexpected oauth state cookie: %+v", stateCookie)
	}
	loc := rec.Header().Get("Location")
	if !strings.Contains(loc, url.QueryEscape(stateCookie.Value)) {
		t.Fatalf("redirect URL %q missing state %q", loc, stateCookie.Value)
	}

	// 3. Mismatched state fails CSRF check
	rec = httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/google/callback?state=wrong&code=abc", nil)
	req.AddCookie(stateCookie)
	h.GoogleCallback(rec, req)
	if rec.Code != http.StatusFound || rec.Header().Get("Location") != "http://localhost:3000/login?error=oauth_state" {
		t.Fatalf("expected oauth_state redirect, got %d -> %s", rec.Code, rec.Header().Get("Location"))
	}

	// 4. Unverified email is rejected
	google.user.VerifiedEmail = false
	rec = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodGet, "/api/v1/auth/google/callback?state="+url.QueryEscape(stateCookie.Value)+"&code=abc", nil)
	req.AddCookie(stateCookie)
	h.GoogleCallback(rec, req)
	if rec.Code != http.StatusFound || rec.Header().Get("Location") != "http://localhost:3000/login?error=oauth_unverified" {
		t.Fatalf("expected oauth_unverified redirect, got %d -> %s", rec.Code, rec.Header().Get("Location"))
	}
	google.user.VerifiedEmail = true

	// 5. Valid callback creates new user and sets session cookies
	rec = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodGet, "/api/v1/auth/google/callback?state="+url.QueryEscape(stateCookie.Value)+"&code=abc", nil)
	req.AddCookie(stateCookie)
	h.GoogleCallback(rec, req)
	if rec.Code != http.StatusFound || rec.Header().Get("Location") != "http://localhost:3000/dashboard" {
		t.Fatalf("expected redirect to /dashboard, got %d -> %s", rec.Code, rec.Header().Get("Location"))
	}
	cbCookies := rec.Result().Cookies()
	if findCookie(cbCookies, auth.AccessCookieName) == nil || findCookie(cbCookies, auth.RefreshCookieName) == nil {
		t.Fatalf("expected access and refresh cookies on Google callback")
	}

	// 6. Account linking: existing email/password user gets linked by email
	hash, _ := auth.HashPassword("ExistingPass123!")
	existing, err := store.CreateUser(context.Background(), sqlc.CreateUserParams{
		Email:        "existing@oauife.edu.ng",
		PasswordHash: pgtype.Text{String: hash, Valid: true},
		FullName:     "Existing User",
		Department:   "Mechanical Engineering",
		Level:        "200L",
		Role:         "student",
		AvatarColor:  "#EA580C",
	})
	if err != nil {
		t.Fatalf("seed existing user: %v", err)
	}
	google.user = &auth.GoogleUserInfo{
		ID:            "google-sub-existing",
		Email:         "existing@oauife.edu.ng",
		VerifiedEmail: true,
		Name:          "Existing User",
	}

	rec = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodGet, "/api/v1/auth/google/callback?state="+url.QueryEscape(stateCookie.Value)+"&code=abc", nil)
	req.AddCookie(stateCookie)
	h.GoogleCallback(rec, req)
	if rec.Code != http.StatusFound || rec.Header().Get("Location") != "http://localhost:3000/dashboard" {
		t.Fatalf("expected redirect to /dashboard for linked user, got %d -> %s", rec.Code, rec.Header().Get("Location"))
	}

	linked, err := store.GetUserByID(context.Background(), existing.ID)
	if err != nil || !linked.GoogleID.Valid || linked.GoogleID.String != "google-sub-existing" {
		t.Fatalf("expected existing user to be linked with google_id, got %+v (err=%v)", linked, err)
	}

	// 7. OAuth-only account attempting password login gets OAUTH_ONLY_ACCOUNT
	rec = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", strings.NewReader(`{"email":"student@oauife.edu.ng","password":"any-password"}`))
	h.Login(rec, req)
	if rec.Code != http.StatusUnauthorized || !strings.Contains(rec.Body.String(), "OAUTH_ONLY_ACCOUNT") {
		t.Fatalf("expected OAUTH_ONLY_ACCOUNT error, got %d (%s)", rec.Code, rec.Body.String())
	}
}
