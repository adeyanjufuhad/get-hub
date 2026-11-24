package handlers

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	httpapi "github.com/adeyanjufuhad/get-hub/backend/internal/http"
	"github.com/adeyanjufuhad/get-hub/backend/internal/library"
)

// downloadLinkTTL is how long a presigned download URL stays valid.
const downloadLinkTTL = 10 * time.Minute

type libraryCatalogue interface {
	ListCourses(ctx context.Context) ([]library.Course, error)
	ListMaterials(ctx context.Context) ([]library.Material, error)
	GetPublished(ctx context.Context, id uuid.UUID) (library.Material, error)
	IncrementDownloads(ctx context.Context, id uuid.UUID) error
}

type LibraryHandler struct {
	repo    libraryCatalogue
	storage library.Storage // nil when object storage is not configured
	logger  *slog.Logger
}

func NewLibraryHandler(repo libraryCatalogue, storage library.Storage, logger *slog.Logger) *LibraryHandler {
	return &LibraryHandler{repo: repo, storage: storage, logger: logger}
}

// List returns every published material plus the course list, in one payload (the catalogue is small).
func (h *LibraryHandler) List(w http.ResponseWriter, r *http.Request) {
	courses, err := h.repo.ListCourses(r.Context())
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load the library.")
		return
	}
	materials, err := h.repo.ListMaterials(r.Context())
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load the library.")
		return
	}
	httpapi.WriteJSON(w, http.StatusOK, map[string]any{
		"courses":           courses,
		"materials":         materials,
		"downloads_enabled": h.storage != nil,
	})
}

// DownloadLink returns a short-lived signed URL for one file. The browser then fetches the
// file straight from object storage, so large PDFs never stream through the API.
func (h *LibraryHandler) DownloadLink(w http.ResponseWriter, r *http.Request) {
	if h.storage == nil {
		httpapi.WriteError(w, http.StatusServiceUnavailable, "LIBRARY_DISABLED", "Downloads are not available on this server yet.")
		return
	}
	id, err := uuid.Parse(chi.URLParam(r, "materialId"))
	if err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_ID", "Invalid material id.")
		return
	}
	m, err := h.repo.GetPublished(r.Context(), id)
	if errors.Is(err, library.ErrNotFound) {
		httpapi.WriteError(w, http.StatusNotFound, "NOT_FOUND", "That file is no longer in the library.")
		return
	}
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not prepare the download.")
		return
	}

	link, err := h.storage.PresignDownload(r.Context(), m.ObjectKey(), m.FileName, downloadLinkTTL)
	if err != nil {
		h.logger.Error("presign library download", "material_id", m.ID, "error", err)
		httpapi.WriteError(w, http.StatusBadGateway, "STORAGE_ERROR", "Could not prepare the download. Please try again.")
		return
	}
	if err := h.repo.IncrementDownloads(r.Context(), m.ID); err != nil {
		h.logger.Warn("count library download", "material_id", m.ID, "error", err)
	}

	w.Header().Set("Cache-Control", "no-store")
	httpapi.WriteJSON(w, http.StatusOK, map[string]any{
		"url":        link,
		"file_name":  m.FileName,
		"expires_at": time.Now().UTC().Add(downloadLinkTTL),
	})
}
