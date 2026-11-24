package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/google/uuid"
	"golang.org/x/time/rate"
)

func TestPasswordHashAndVerify(t *testing.T) {
	hash, err := HashPassword("CorrectHorseBatteryStaple!")
	if err != nil {
		t.Fatalf("HashPassword unexpected error: %v", err)
	}

	ok, err := VerifyPassword("CorrectHorseBatteryStaple!", hash)
	if err != nil || !ok {
		t.Fatalf("VerifyPassword expected true, got ok=%v err=%v", ok, err)
	}

	ok, err = VerifyPassword("wrong-password", hash)
	if err != nil {
		t.Fatalf("VerifyPassword wrong password returned error: %v", err)
	}
	if ok {
		t.Fatalf("VerifyPassword expected false for wrong password")
	}

	if _, err := HashPassword("short"); err != ErrWeakPassword {
		t.Fatalf("expected ErrWeakPassword, got %v", err)
	}
}

func TestTokenIssueParseAndExpiry(t *testing.T) {
	uid := uuid.New()
	tm := NewTokenManager("super-secret-key-at-least-32-chars-long", 5*time.Minute, 24*time.Hour)

	tok, err := tm.IssueAccessToken(uid, "student@oauife.edu.ng", "student")
	if err != nil {
		t.Fatalf("IssueAccessToken failed: %v", err)
	}

	claims, err := tm.ParseAccessToken(tok)
	if err != nil {
		t.Fatalf("ParseAccessToken failed: %v", err)
	}
	if claims.UserID != uid || claims.Role != "student" || claims.Email != "student@oauife.edu.ng" {
		t.Fatalf("unexpected claims: %+v", claims)
	}

	// Wrong secret must fail
	other := NewTokenManager("different-secret-key-at-least-32-chars", 5*time.Minute, 24*time.Hour)
	if _, err := other.ParseAccessToken(tok); err == nil {
		t.Fatalf("expected ParseAccessToken to fail with wrong secret")
	}

	// Expired token must fail
	expiredTM := NewTokenManager("super-secret-key-at-least-32-chars-long", -1*time.Minute, 24*time.Hour)
	expiredTok, err := expiredTM.IssueAccessToken(uid, "student@oauife.edu.ng", "student")
	if err != nil {
		t.Fatalf("IssueAccessToken expired failed: %v", err)
	}
	if _, err := tm.ParseAccessToken(expiredTok); err == nil {
		t.Fatalf("expected expired token to be rejected")
	}
}

func TestRefreshTokenGenerationAndHashing(t *testing.T) {
	raw1, hash1, err := GenerateRefreshToken()
	if err != nil {
		t.Fatalf("GenerateRefreshToken failed: %v", err)
	}
	raw2, hash2, err := GenerateRefreshToken()
	if err != nil {
		t.Fatalf("GenerateRefreshToken 2 failed: %v", err)
	}
	if raw1 == raw2 || hash1 == hash2 {
		t.Fatalf("expected distinct refresh tokens and hashes")
	}
	if HashOpaqueToken(raw1) != hash1 {
		t.Fatalf("HashOpaqueToken did not reproduce hash")
	}
}

func TestAuthAndAdminMiddleware(t *testing.T) {
	tm := NewTokenManager("super-secret-key-at-least-32-chars-long", 15*time.Minute, 24*time.Hour)
	studentTok, _ := tm.IssueAccessToken(uuid.New(), "s@oau.edu.ng", "student")
	adminTok, _ := tm.IssueAccessToken(uuid.New(), "a@oau.edu.ng", "admin")

	protected := RequireAuth(tm)(RequireAdmin(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})))

	// 1. Missing cookie -> 401
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/questions", nil)
	protected.ServeHTTP(rec, req)
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for unauthenticated request, got %d", rec.Code)
	}

	// 2. Student cookie -> 403
	rec = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodGet, "/api/v1/admin/questions", nil)
	req.AddCookie(&http.Cookie{Name: AccessCookieName, Value: studentTok})
	protected.ServeHTTP(rec, req)
	if rec.Code != http.StatusForbidden {
		t.Fatalf("expected 403 for student accessing admin route, got %d", rec.Code)
	}

	// 3. Admin cookie -> 200
	rec = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodGet, "/api/v1/admin/questions", nil)
	req.AddCookie(&http.Cookie{Name: AccessCookieName, Value: adminTok})
	protected.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 for admin accessing admin route, got %d", rec.Code)
	}
}

func TestIPRateLimiter(t *testing.T) {
	rl := NewIPRateLimiter(rate.Limit(0.01), 2)
	h := rl.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	for i := 0; i < 2; i++ {
		rec := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", nil)
		req.RemoteAddr = "197.210.1.10:5555"
		h.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("request %d expected 200, got %d", i+1, rec.Code)
		}
	}

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", nil)
	req.RemoteAddr = "197.210.1.10:5555"
	h.ServeHTTP(rec, req)
	if rec.Code != http.StatusTooManyRequests {
		t.Fatalf("3rd request expected 429, got %d", rec.Code)
	}
}
