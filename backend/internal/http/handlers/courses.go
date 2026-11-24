package handlers

import (
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/adeyanjufuhad/get-hub/backend/internal/access"
	"github.com/adeyanjufuhad/get-hub/backend/internal/auth"
	"github.com/adeyanjufuhad/get-hub/backend/internal/config"
	"github.com/adeyanjufuhad/get-hub/backend/internal/db/sqlc"
	httpapi "github.com/adeyanjufuhad/get-hub/backend/internal/http"
)

type CoursesHandler struct {
	queries *sqlc.Queries
	cfg     config.Config
	policy  access.Policy
}

func NewCoursesHandler(queries *sqlc.Queries, cfg config.Config, policy access.Policy) *CoursesHandler {
	return &CoursesHandler{queries: queries, cfg: cfg, policy: policy}
}

type CourseWithProgress struct {
	sqlc.Course
	TotalTopics     int `json:"total_topics"`
	CompletedTopics int `json:"completed_topics"`
}

func (h *CoursesHandler) List(w http.ResponseWriter, r *http.Request) {
	courses, err := h.queries.ListActiveCourses(r.Context())
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not fetch courses.")
		return
	}

	completedByTopic := make(map[uuid.UUID]bool)
	if id, ok := auth.FromContext(r.Context()); ok {
		if progressList, err := h.queries.ListTopicProgressByUser(r.Context(), id.UserID); err == nil {
			for _, tp := range progressList {
				if tp.CompletedAt.Valid {
					completedByTopic[tp.TopicID] = true
				}
			}
		}
	}

	out := make([]CourseWithProgress, 0, len(courses))
	for _, c := range courses {
		topics, err := h.queries.ListTopicsByCourse(r.Context(), c.ID, h.cfg.IncludeDraftContent)
		if err != nil {
			httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not fetch course topics.")
			return
		}
		completed := 0
		for _, t := range topics {
			if completedByTopic[t.ID] {
				completed++
			}
		}
		out = append(out, CourseWithProgress{
			Course:          c,
			TotalTopics:     len(topics),
			CompletedTopics: completed,
		})
	}

	httpapi.WriteJSON(w, http.StatusOK, map[string]any{"courses": out})
}

type TopicWithProgress struct {
	sqlc.Topic
	Completed    bool `json:"completed"`
	CanAccess    bool `json:"can_access"`
	QuestionCount int `json:"question_count"`
}

func (h *CoursesHandler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	course, err := h.queries.GetCourseBySlug(r.Context(), slug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			httpapi.WriteError(w, http.StatusNotFound, "NOT_FOUND", "Course not found.")
			return
		}
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load course.")
		return
	}

	topics, err := h.queries.ListTopicsByCourse(r.Context(), course.ID, h.cfg.IncludeDraftContent)
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load course topics.")
		return
	}

	completedByTopic := make(map[uuid.UUID]bool)
	accessUser := access.User{Role: "student"}
	if id, ok := auth.FromContext(r.Context()); ok {
		accessUser.ID = id.UserID
		accessUser.Role = id.Role
		if progressList, err := h.queries.ListTopicProgressByUser(r.Context(), id.UserID); err == nil {
			for _, tp := range progressList {
				if tp.CompletedAt.Valid {
					completedByTopic[tp.TopicID] = true
				}
			}
		}
	}

	topicDTOs := make([]TopicWithProgress, 0, len(topics))
	for _, t := range topics {
		qs, _ := h.queries.ListQuestionsByTopic(r.Context(), t.ID, h.cfg.IncludeDraftContent)
		allowed := access.CanAccess(accessUser, access.Item{ID: t.ID, Kind: "topic", IsFree: t.IsFree}, h.policy)
		topicDTOs = append(topicDTOs, TopicWithProgress{
			Topic:         t,
			Completed:     completedByTopic[t.ID],
			CanAccess:     allowed,
			QuestionCount: len(qs),
		})
	}

	httpapi.WriteJSON(w, http.StatusOK, map[string]any{
		"course": course,
		"topics": topicDTOs,
	})
}

func (h *CoursesHandler) MarkTopicViewed(w http.ResponseWriter, r *http.Request) {
	id, ok := auth.FromContext(r.Context())
	if !ok {
		httpapi.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication required.")
		return
	}
	topicID, err := uuid.Parse(chi.URLParam(r, "topicId"))
	if err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_ID", "Invalid topic ID.")
		return
	}

	tp, err := h.queries.UpsertTopicView(r.Context(), id.UserID, topicID)
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not record topic view.")
		return
	}
	httpapi.WriteJSON(w, http.StatusOK, map[string]any{"progress": tp})
}

type setCompletedRequest struct {
	Completed bool `json:"completed"`
}

func (h *CoursesHandler) SetTopicCompleted(w http.ResponseWriter, r *http.Request) {
	id, ok := auth.FromContext(r.Context())
	if !ok {
		httpapi.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication required.")
		return
	}
	topicID, err := uuid.Parse(chi.URLParam(r, "topicId"))
	if err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_ID", "Invalid topic ID.")
		return
	}

	var req setCompletedRequest
	if err := httpapi.DecodeJSON(w, r, &req); err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_JSON", "Invalid request body.")
		return
	}

	tp, err := h.queries.SetTopicCompleted(r.Context(), id.UserID, topicID, req.Completed)
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not update topic progress.")
		return
	}
	httpapi.WriteJSON(w, http.StatusOK, map[string]any{"progress": tp})
}

// TopicAccessLoader resolves a topic ID from the route for access.RequireItemAccess middleware.
func (h *CoursesHandler) TopicAccessLoader(r *http.Request) (access.Item, error) {
	topicID, err := uuid.Parse(chi.URLParam(r, "topicId"))
	if err != nil {
		return access.Item{}, err
	}
	t, err := h.queries.GetTopicByID(r.Context(), topicID)
	if err != nil {
		return access.Item{}, err
	}
	return access.Item{ID: t.ID, Kind: "topic", IsFree: t.IsFree}, nil
}
