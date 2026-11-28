package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/adeyanjufuhad/get-hub/backend/internal/auth"
	"github.com/adeyanjufuhad/get-hub/backend/internal/db/sqlc"
)

func withUser(r *http.Request, userID uuid.UUID) *http.Request {
	if userID == uuid.Nil {
		return r
	}
	return r.WithContext(auth.WithIdentity(r.Context(), auth.Identity{UserID: userID}))
}

func patchMe(t *testing.T, h *AuthHandler, userID uuid.UUID, body string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodPatch, "/api/v1/auth/me", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	h.UpdateMe(rec, withUser(req, userID))
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

	t.Run("updates name and department, keeps level", func(t *testing.T) {
		rec := patchMe(t, h, user.ID, `{"full_name":"  Ada Okafor ","department":"Computer Engineering"}`)
		if rec.Code != http.StatusOK {
			t.Fatalf("status = %d, body = %s", rec.Code, rec.Body.String())
		}
		var out struct {
			User sqlc.User `json:"user"`
		}
		if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
			t.Fatal(err)
		}
		if out.User.FullName != "Ada Okafor" || out.User.Department != "Computer Engineering" {
			t.Fatalf("unexpected user: %+v", out.User)
		}
		if out.User.Level != "200L" || out.User.Email != "ada@example.test" {
			t.Fatalf("level or email changed: %+v", out.User)
		}
	})

	t.Run("rejects invalid fields", func(t *testing.T) {
		rec := patchMe(t, h, user.ID, `{"full_name":"A","department":"Computer Science and Engineering"}`)
		if rec.Code != http.StatusUnprocessableEntity && rec.Code != http.StatusBadRequest {
			t.Fatalf("status = %d, want a validation error", rec.Code)
		}
		for _, field := range []string{"full_name", "department"} {
			if !bytes.Contains(rec.Body.Bytes(), []byte(`"`+field+`"`)) {
				t.Errorf("missing field error for %s: %s", field, rec.Body.String())
			}
		}
	})

	t.Run("rejects level, email or role changes", func(t *testing.T) {
		for _, extra := range []string{`"level":"300L"`, `"email":"x@example.test"`, `"role":"admin"`} {
			rec := patchMe(t, h, user.ID, `{"full_name":"Ada","department":"Civil Engineering",`+extra+`}`)
			if rec.Code != http.StatusBadRequest {
				t.Fatalf("%s: status = %d, want 400 for unknown field", extra, rec.Code)
			}
		}
	})

	t.Run("requires auth", func(t *testing.T) {
		rec := patchMe(t, h, uuid.Nil, `{"full_name":"Ada","department":"Civil Engineering"}`)
		if rec.Code != http.StatusUnauthorized {
			t.Fatalf("status = %d, want 401", rec.Code)
		}
	})
}

// ---- Profile photos ----

type memoryAvatarStore struct {
	avatars map[uuid.UUID]sqlc.UserAvatar
	urls    map[uuid.UUID]string
}

func (m *memoryAvatarStore) UpsertUserAvatar(_ context.Context, arg sqlc.UpsertUserAvatarParams) error {
	m.avatars[arg.UserID] = sqlc.UserAvatar{UserID: arg.UserID, ContentType: arg.ContentType, Data: arg.Data, UpdatedAt: time.Now()}
	return nil
}

func (m *memoryAvatarStore) GetUserAvatar(_ context.Context, userID uuid.UUID) (sqlc.UserAvatar, error) {
	a, ok := m.avatars[userID]
	if !ok {
		return sqlc.UserAvatar{}, pgx.ErrNoRows
	}
	return a, nil
}

func (m *memoryAvatarStore) DeleteUserAvatar(_ context.Context, userID uuid.UUID) error {
	delete(m.avatars, userID)
	return nil
}

func (m *memoryAvatarStore) SetUserAvatarURL(_ context.Context, id uuid.UUID, url string) (sqlc.User, error) {
	m.urls[id] = url
	return sqlc.User{ID: id, AvatarURL: url}, nil
}

// Smallest valid PNG header bytes are enough for http.DetectContentType.
var pngBytes = append([]byte("\x89PNG\r\n\x1a\n"), make([]byte, 64)...)

func uploadAvatar(t *testing.T, h *AvatarHandler, userID uuid.UUID, data []byte) *httptest.ResponseRecorder {
	t.Helper()
	var body bytes.Buffer
	mw := multipart.NewWriter(&body)
	fw, err := mw.CreateFormFile("file", "photo.png")
	if err != nil {
		t.Fatal(err)
	}
	_, _ = fw.Write(data)
	_ = mw.Close()
	req := httptest.NewRequest(http.MethodPut, "/api/v1/auth/me/avatar", &body)
	req.Header.Set("Content-Type", mw.FormDataContentType())
	rec := httptest.NewRecorder()
	h.Upload(rec, withUser(req, userID))
	return rec
}

func serveAvatar(h *AvatarHandler, id string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodGet, "/api/v1/users/"+id+"/avatar", nil)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", id)
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	rec := httptest.NewRecorder()
	h.Serve(rec, req)
	return rec
}

func TestAvatarUploadServeDelete(t *testing.T) {
	store := &memoryAvatarStore{avatars: map[uuid.UUID]sqlc.UserAvatar{}, urls: map[uuid.UUID]string{}}
	h := &AvatarHandler{store: store}
	userID := uuid.New()

	rec := uploadAvatar(t, h, userID, pngBytes)
	if rec.Code != http.StatusOK {
		t.Fatalf("upload status = %d, body = %s", rec.Code, rec.Body.String())
	}
	if url := store.urls[userID]; !strings.HasPrefix(url, "/api/v1/users/"+userID.String()+"/avatar?v=") {
		t.Fatalf("avatar_url = %q", url)
	}

	got := serveAvatar(h, userID.String())
	if got.Code != http.StatusOK || got.Header().Get("Content-Type") != "image/png" {
		t.Fatalf("serve status = %d, type = %q", got.Code, got.Header().Get("Content-Type"))
	}
	if !bytes.Equal(got.Body.Bytes(), pngBytes) {
		t.Fatal("served bytes differ from upload")
	}

	del := httptest.NewRecorder()
	h.Delete(del, withUser(httptest.NewRequest(http.MethodDelete, "/api/v1/auth/me/avatar", nil), userID))
	if del.Code != http.StatusOK || store.urls[userID] != "" {
		t.Fatalf("delete status = %d, url = %q", del.Code, store.urls[userID])
	}
	if serveAvatar(h, userID.String()).Code != http.StatusNotFound {
		t.Fatal("photo still served after delete")
	}
}

func TestAvatarUploadRejects(t *testing.T) {
	store := &memoryAvatarStore{avatars: map[uuid.UUID]sqlc.UserAvatar{}, urls: map[uuid.UUID]string{}}
	h := &AvatarHandler{store: store}
	userID := uuid.New()

	if rec := uploadAvatar(t, h, userID, []byte("<svg xmlns='http://www.w3.org/2000/svg'></svg>")); rec.Code != http.StatusUnsupportedMediaType {
		t.Errorf("svg: status = %d, want 415", rec.Code)
	}
	big := append([]byte("\x89PNG\r\n\x1a\n"), make([]byte, maxAvatarBytes)...)
	if rec := uploadAvatar(t, h, userID, big); rec.Code != http.StatusRequestEntityTooLarge {
		t.Errorf("oversized: status = %d, want 413", rec.Code)
	}
	if rec := uploadAvatar(t, h, uuid.Nil, pngBytes); rec.Code != http.StatusUnauthorized {
		t.Errorf("no auth: status = %d, want 401", rec.Code)
	}
	if len(store.avatars) != 0 {
		t.Errorf("rejected uploads were stored: %d", len(store.avatars))
	}
}
