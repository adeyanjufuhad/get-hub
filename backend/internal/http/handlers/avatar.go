package handlers

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/adeyanjufuhad/get-hub/backend/internal/auth"
	"github.com/adeyanjufuhad/get-hub/backend/internal/db/sqlc"
	httpapi "github.com/adeyanjufuhad/get-hub/backend/internal/http"
)

// maxAvatarBytes caps a stored profile photo. The web app shrinks photos to
// 256×256 WebP before uploading (~10–40 KB), so this is generous.
const maxAvatarBytes = 512 << 10

// allowedAvatarTypes maps sniffed content types to themselves; anything else is rejected.
var allowedAvatarTypes = map[string]bool{
	"image/webp": true,
	"image/png":  true,
	"image/jpeg": true,
}

type avatarStore interface {
	UpsertUserAvatar(ctx context.Context, arg sqlc.UpsertUserAvatarParams) error
	GetUserAvatar(ctx context.Context, userID uuid.UUID) (sqlc.UserAvatar, error)
	DeleteUserAvatar(ctx context.Context, userID uuid.UUID) error
	SetUserAvatarURL(ctx context.Context, id uuid.UUID, avatarURL string) (sqlc.User, error)
}

// AvatarHandler stores profile photos in Postgres (the API's upload directory is
// ephemeral on the host, so files there would not survive a redeploy).
type AvatarHandler struct {
	store avatarStore
}

func NewAvatarHandler(store *sqlc.Queries) *AvatarHandler {
	return &AvatarHandler{store: store}
}

func avatarURL(userID uuid.UUID, at time.Time) string {
	// The version query string busts caches whenever the photo changes.
	return fmt.Sprintf("/api/v1/users/%s/avatar?v=%d", userID, at.Unix())
}

// Upload replaces the signed-in user's photo with the multipart "file" field.
func (h *AvatarHandler) Upload(w http.ResponseWriter, r *http.Request) {
	id, ok := auth.FromContext(r.Context())
	if !ok {
		httpapi.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication required.")
		return
	}

	// Allow a little room for multipart framing on top of the image itself.
	r.Body = http.MaxBytesReader(w, r.Body, maxAvatarBytes+64<<10)
	file, _, err := r.FormFile("file")
	if err != nil {
		var tooBig *http.MaxBytesError
		if errors.As(err, &tooBig) {
			httpapi.WriteError(w, http.StatusRequestEntityTooLarge, "FILE_TOO_LARGE", "Photo must be under 512 KB.")
			return
		}
		httpapi.WriteError(w, http.StatusBadRequest, "MISSING_FILE", "Attach a photo in the \"file\" field.")
		return
	}
	defer file.Close()

	data, err := io.ReadAll(io.LimitReader(file, maxAvatarBytes+1))
	if err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_FILE", "Could not read the photo.")
		return
	}
	if len(data) == 0 {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_FILE", "The photo is empty.")
		return
	}
	if len(data) > maxAvatarBytes {
		httpapi.WriteError(w, http.StatusRequestEntityTooLarge, "FILE_TOO_LARGE", "Photo must be under 512 KB.")
		return
	}
	// Trust the bytes, not the client's declared type.
	contentType := http.DetectContentType(data)
	if !allowedAvatarTypes[contentType] {
		httpapi.WriteError(w, http.StatusUnsupportedMediaType, "UNSUPPORTED_TYPE", "Use a JPEG, PNG or WebP image.")
		return
	}

	if err := h.store.UpsertUserAvatar(r.Context(), sqlc.UpsertUserAvatarParams{
		UserID: id.UserID, ContentType: contentType, Data: data,
	}); err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not save your photo.")
		return
	}
	user, err := h.store.SetUserAvatarURL(r.Context(), id.UserID, avatarURL(id.UserID, time.Now()))
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not save your photo.")
		return
	}
	httpapi.WriteJSON(w, http.StatusOK, map[string]any{"user": user})
}

// Delete removes the signed-in user's photo; the app falls back to initials.
func (h *AvatarHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, ok := auth.FromContext(r.Context())
	if !ok {
		httpapi.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication required.")
		return
	}
	if err := h.store.DeleteUserAvatar(r.Context(), id.UserID); err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not remove your photo.")
		return
	}
	user, err := h.store.SetUserAvatarURL(r.Context(), id.UserID, "")
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not remove your photo.")
		return
	}
	httpapi.WriteJSON(w, http.StatusOK, map[string]any{"user": user})
}

// Serve returns a user's photo. URLs are versioned, so responses cache for a long time.
func (h *AvatarHandler) Serve(w http.ResponseWriter, r *http.Request) {
	userID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		httpapi.WriteError(w, http.StatusNotFound, "NOT_FOUND", "Photo not found.")
		return
	}
	avatar, err := h.store.GetUserAvatar(r.Context(), userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			httpapi.WriteError(w, http.StatusNotFound, "NOT_FOUND", "Photo not found.")
			return
		}
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load the photo.")
		return
	}
	w.Header().Set("Content-Type", avatar.ContentType)
	w.Header().Set("Content-Length", strconv.Itoa(len(avatar.Data)))
	w.Header().Set("Cache-Control", "private, max-age=31536000, immutable")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Content-Security-Policy", "default-src 'none'; sandbox")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(avatar.Data)
}
