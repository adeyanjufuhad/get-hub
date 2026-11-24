package handlers

import (
	"errors"
	"net/http"
	"sort"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/adeyanjufuhad/get-hub/backend/internal/auth"
	"github.com/adeyanjufuhad/get-hub/backend/internal/config"
	"github.com/adeyanjufuhad/get-hub/backend/internal/db/sqlc"
	httpapi "github.com/adeyanjufuhad/get-hub/backend/internal/http"
	"github.com/adeyanjufuhad/get-hub/backend/internal/progress"
)

type DashboardHandler struct {
	queries *sqlc.Queries
	cfg     config.Config
}

func NewDashboardHandler(queries *sqlc.Queries, cfg config.Config) *DashboardHandler {
	return &DashboardHandler{queries: queries, cfg: cfg}
}

type TopicAccuracyDTO struct {
	TopicID                  uuid.UUID `json:"topic_id"`
	TopicSlug                string    `json:"topic_slug"`
	TopicTitle               string    `json:"topic_title"`
	CourseID                 uuid.UUID `json:"course_id"`
	CourseCode               string    `json:"course_code"`
	CourseSlug               string    `json:"course_slug"`
	AttemptsCount            int32     `json:"attempts_count"`
	CorrectCount             int32     `json:"correct_count"`
	UniqueQuestionsAttempted int32     `json:"unique_questions_attempted"`
	AccuracyPct              int       `json:"accuracy_pct"`
	Completed                bool      `json:"completed"`
}

func (h *DashboardHandler) Get(w http.ResponseWriter, r *http.Request) {
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

	courses, err := h.queries.ListActiveCourses(r.Context())
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load courses.")
		return
	}

	progressRows, _ := h.queries.ListTopicProgressByUser(r.Context(), id.UserID)
	completedSet := make(map[uuid.UUID]bool, len(progressRows))
	for _, p := range progressRows {
		if p.CompletedAt.Valid {
			completedSet[p.TopicID] = true
		}
	}

	courseProgress := make([]CourseWithProgress, 0, len(courses))
	totalTopics := 0
	completedTopics := 0
	for _, c := range courses {
		topics, _ := h.queries.ListTopicsByCourse(r.Context(), c.ID, h.cfg.IncludeDraftContent)
		done := 0
		for _, t := range topics {
			if completedSet[t.ID] {
				done++
			}
		}
		totalTopics += len(topics)
		completedTopics += done
		courseProgress = append(courseProgress, CourseWithProgress{
			Course:          c,
			TotalTopics:     len(topics),
			CompletedTopics: done,
		})
	}

	var continueTopic *sqlc.LastViewedTopicRow
	if last, err := h.queries.GetLastViewedTopic(r.Context(), id.UserID); err == nil {
		continueTopic = &last
	} else if !errors.Is(err, pgx.ErrNoRows) {
		continueTopic = nil
	}

	activityDays, _ := h.queries.ListUserActivityDays(r.Context(), id.UserID)
	streakDays := progress.ComputeStreak(activityDays, time.Now())

	stats, _ := h.queries.ListUserTopicStats(r.Context(), id.UserID, h.cfg.IncludeDraftContent)
	topicStats := make([]TopicAccuracyDTO, 0, len(stats))
	weakTopics := make([]TopicAccuracyDTO, 0)
	var totalAttempts, totalCorrect int32

	for _, s := range stats {
		acc := 0
		if s.AttemptsCount > 0 {
			acc = int((s.CorrectCount * 100) / s.AttemptsCount)
		}
		totalAttempts += s.AttemptsCount
		totalCorrect += s.CorrectCount

		dto := TopicAccuracyDTO{
			TopicID:                  s.TopicID,
			TopicSlug:                s.TopicSlug,
			TopicTitle:               s.TopicTitle,
			CourseID:                 s.CourseID,
			CourseCode:               s.CourseCode,
			CourseSlug:               s.CourseSlug,
			AttemptsCount:            s.AttemptsCount,
			CorrectCount:             s.CorrectCount,
			UniqueQuestionsAttempted: s.UniqueQuestionsAttempted,
			AccuracyPct:              acc,
			Completed:                completedSet[s.TopicID],
		}
		topicStats = append(topicStats, dto)
		if s.AttemptsCount > 0 && acc < 70 {
			weakTopics = append(weakTopics, dto)
		}
	}

	sort.Slice(weakTopics, func(i, j int) bool {
		return weakTopics[i].AccuracyPct < weakTopics[j].AccuracyPct
	})

	overallAccuracy := 0
	if totalAttempts > 0 {
		overallAccuracy = int((totalCorrect * 100) / totalAttempts)
	}

	recentExams, _ := h.queries.ListMockExamsByUser(r.Context(), id.UserID)

	httpapi.WriteJSON(w, http.StatusOK, map[string]any{
		"user":           user,
		"streak_days":    streakDays,
		"continue_topic": continueTopic,
		"summary": map[string]any{
			"total_topics":     totalTopics,
			"completed_topics": completedTopics,
			"total_attempts":   totalAttempts,
			"overall_accuracy": overallAccuracy,
		},
		"courses":      courseProgress,
		"topic_stats":  topicStats,
		"weak_topics":  weakTopics,
		"recent_exams": recentExams,
	})
}
