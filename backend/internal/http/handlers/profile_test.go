package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"

	"github.com/adeyanjufuhad/get-hub/backend/internal/auth"
	"github.com/adeyanjufuhad/get-hub/backend/internal/db/sqlc"
)

func patchMe(t *testing.T, h *AuthHandler, userID uuid.UUID, body string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodPatch, "/api/v1/auth/me", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	if userID != uuid.Nil {
		req = req.WithContext(auth.WithIdentity(req.Context(), auth.Identity{UserID: userID}))
	}
	rec := httptest.NewRecorder()
	h.UpdateMe(rec, req)
	return rec
}

func TestUpdateMe(t *testing.T) {
	store := newMemoryAuthStore()
	h, _ := newTestAuthHandler(store, &stubGoogleOAuth{})
	user, err := store.CreateUser(context.Background(), sqlc.CreateUserParams{
		Email: "ada@example.test", FullName: "Ada O", Department: "Civil Engineering",
		Level: "200L", Role: "student", AvatarColor: "#EA580C",
	})
	if err != nil {
		t.Fatal(err)
	}

	t.Run("updates name, department and level", func(t *testing.T) {
		rec := patchMe(t, h, user.ID, `{"full_name":"  Ada Okafor ","department":"Computer Engineering","level":"300L"}`)
		if rec.Code != http.StatusOK {
			t.Fatalf("status = %d, body = %s", rec.Code, rec.Body.String())
		}
		var out struct {
			User sqlc.User `json:"user"`
		}
		if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
			t.Fatal(err)
		}
		if out.User.FullName != "Ada Okafor" || out.User.Department != "Computer Engineering" || out.User.Level != "300L" {
			t.Fatalf("unexpected user: %+v", out.User)
		}
		if out.User.Email != "ada@example.test" {
			t.Fatalf("email changed: %q", out.User.Email)
		}
	})

	t.Run("rejects invalid fields", func(t *testing.T) {
		rec := patchMe(t, h, user.ID, `{"full_name":"A","department":"Law","level":"900L"}`)
		if rec.Code != http.StatusUnprocessableEntity && rec.Code != http.StatusBadRequest {
			t.Fatalf("status = %d, want a validation error", rec.Code)
		}
		for _, field := range []string{"full_name", "department", "level"} {
			if !bytes.Contains(rec.Body.Bytes(), []byte(`"`+field+`"`)) {
				t.Errorf("missing field error for %s: %s", field, rec.Body.String())
			}
		}
	})

	t.Run("rejects email or role changes", func(t *testing.T) {
		rec := patchMe(t, h, user.ID, `{"full_name":"Ada","department":"Civil Engineering","level":"200L","role":"admin"}`)
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("status = %d, want 400 for unknown field", rec.Code)
		}
	})

	t.Run("requires auth", func(t *testing.T) {
		rec := patchMe(t, h, uuid.Nil, `{"full_name":"Ada","department":"Civil Engineering","level":"200L"}`)
		if rec.Code != http.StatusUnauthorized {
			t.Fatalf("status = %d, want 401", rec.Code)
		}
	})
}
