package handlers

import (
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/adeyanjufuhad/get-hub/backend/internal/access"
	"github.com/adeyanjufuhad/get-hub/backend/internal/auth"
	"github.com/adeyanjufuhad/get-hub/backend/internal/config"
	"github.com/adeyanjufuhad/get-hub/backend/internal/db/sqlc"
	httpapi "github.com/adeyanjufuhad/get-hub/backend/internal/http"
	"github.com/adeyanjufuhad/get-hub/backend/internal/questions"
)

type PracticeHandler struct {
	queries *sqlc.Queries
	cfg     config.Config
	policy  access.Policy
}

func NewPracticeHandler(queries *sqlc.Queries, cfg config.Config, policy access.Policy) *PracticeHandler {
	return &PracticeHandler{queries: queries, cfg: cfg, policy: policy}
}

// ListTopicQuestions returns sanitized questions (never leaking is_correct, numeric_answer, or solution_md).
func (h *PracticeHandler) ListTopicQuestions(w http.ResponseWriter, r *http.Request) {
	topicID, err := uuid.Parse(chi.URLParam(r, "topicId"))
	if err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_ID", "Invalid topic ID.")
		return
	}

	topic, err := h.queries.GetTopicByID(r.Context(), topicID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			httpapi.WriteError(w, http.StatusNotFound, "NOT_FOUND", "Topic not found.")
			return
		}
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load topic.")
		return
	}
	course, _ := h.queries.GetCourseByID(r.Context(), topic.CourseID)

	qs, err := h.queries.ListQuestionsByTopic(r.Context(), topicID, h.cfg.IncludeDraftContent)
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load practice questions.")
		return
	}

	qIDs := make([]uuid.UUID, 0, len(qs))
	for _, q := range qs {
		qIDs = append(qIDs, q.ID)
	}

	optsByQ := make(map[uuid.UUID][]sqlc.QuestionOption)
	if len(qIDs) > 0 {
		allOpts, err := h.queries.ListQuestionOptionsByQuestionIDs(r.Context(), qIDs)
		if err != nil {
			httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load question options.")
			return
		}
		for _, o := range allOpts {
			optsByQ[o.QuestionID] = append(optsByQ[o.QuestionID], o)
		}
	}

	publicQs := make([]questions.PublicQuestion, 0, len(qs))
	for _, q := range qs {
		publicQs = append(publicQs, questions.ToPublic(q, optsByQ[q.ID]))
	}

	httpapi.WriteJSON(w, http.StatusOK, map[string]any{
		"topic":     topic,
		"course":    course,
		"questions": publicQs,
	})
}

type submitAttemptRequest struct {
	SelectedOptionID *uuid.UUID `json:"selected_option_id"`
	NumericInput     *float64   `json:"numeric_input"`
	TimeTakenMs      int32      `json:"time_taken_ms"`
}

// SubmitAttempt grades a single practice answer on the server, logs the attempt, and returns feedback + solution.
func (h *PracticeHandler) SubmitAttempt(w http.ResponseWriter, r *http.Request) {
	id, ok := auth.FromContext(r.Context())
	if !ok {
		httpapi.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication required.")
		return
	}

	questionID, err := uuid.Parse(chi.URLParam(r, "questionId"))
	if err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_ID", "Invalid question ID.")
		return
	}

	var req submitAttemptRequest
	if err := httpapi.DecodeJSON(w, r, &req); err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_JSON", "Invalid request body.")
		return
	}
	if req.TimeTakenMs < 0 {
		req.TimeTakenMs = 0
	}

	q, err := h.queries.GetQuestionByID(r.Context(), questionID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			httpapi.WriteError(w, http.StatusNotFound, "NOT_FOUND", "Question not found.")
			return
		}
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not fetch question.")
		return
	}

	var (
		isCorrect       bool
		correctOptionID *uuid.UUID
		expectedNumeric *float64
		selOptParam     pgtype.UUID
		numInputParam   pgtype.Float8
	)

	switch q.QuestionType {
	case "mcq":
		opts, err := h.queries.ListQuestionOptionsByQuestionID(r.Context(), q.ID)
		if err != nil {
			httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load options.")
			return
		}
		forGrading := make([]questions.OptionForGrading, 0, len(opts))
		for _, o := range opts {
			forGrading = append(forGrading, questions.OptionForGrading{ID: o.ID, IsCorrect: o.IsCorrect})
		}
		okChoice, cid, err := questions.CheckMCQ(forGrading, req.SelectedOptionID)
		if err != nil {
			httpapi.WriteError(w, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
			return
		}
		isCorrect = okChoice
		correctOptionID = &cid
		selOptParam = pgtype.UUID{Bytes: *req.SelectedOptionID, Valid: true}

	case "numeric":
		if !q.NumericAnswer.Valid {
			httpapi.WriteError(w, http.StatusInternalServerError, "QUESTION_MISCONFIGURED", "Question is missing expected answer.")
			return
		}
		if req.SelectedOptionID != nil {
			synth := questions.SynthesizeMCQ(q)
			chosen, cid := questions.MatchSyntheticOption(synth, req.SelectedOptionID)
			if chosen == nil {
				httpapi.WriteError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Selected option does not belong to this question.")
				return
			}
			isCorrect = chosen.IsCorrect
			correctOptionID = &cid
			// Store the chosen option's numeric value so attempts.selected_option_id FK stays valid.
			numInputParam = pgtype.Float8{Float64: chosen.Value, Valid: true}
		} else {
			okNum, err := questions.CheckNumeric(q.NumericAnswer.Float64, q.NumericTolerancePct, req.NumericInput)
			if err != nil {
				httpapi.WriteError(w, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
				return
			}
			isCorrect = okNum
			v := q.NumericAnswer.Float64
			expectedNumeric = &v
			numInputParam = pgtype.Float8{Float64: *req.NumericInput, Valid: true}
		}

	default:
		httpapi.WriteError(w, http.StatusInternalServerError, "UNSUPPORTED_TYPE", "Unsupported question type.")
		return
	}

	attempt, err := h.queries.CreateAttempt(r.Context(), sqlc.CreateAttemptParams{
		UserID:           id.UserID,
		QuestionID:       q.ID,
		TopicID:          q.TopicID,
		SelectedOptionID: selOptParam,
		NumericInput:     numInputParam,
		IsCorrect:        isCorrect,
		TimeTakenMs:      req.TimeTakenMs,
	})
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not save your attempt.")
		return
	}

	httpapi.WriteJSON(w, http.StatusOK, map[string]any{
		"attempt_id":            attempt.ID,
		"is_correct":            isCorrect,
		"correct_option_id":     correctOptionID,
		"numeric_answer":        expectedNumeric,
		"numeric_tolerance_pct": q.NumericTolerancePct,
		"numeric_unit":          q.NumericUnit,
		"solution_md":           q.SolutionMd,
	})
}

// QuestionAccessLoader resolves a question for access.RequireItemAccess middleware.
func (h *PracticeHandler) QuestionAccessLoader(r *http.Request) (access.Item, error) {
	qid, err := uuid.Parse(chi.URLParam(r, "questionId"))
	if err != nil {
		return access.Item{}, err
	}
	q, err := h.queries.GetQuestionByID(r.Context(), qid)
	if err != nil {
		return access.Item{}, err
	}
	return access.Item{ID: q.ID, Kind: "question", IsFree: q.IsFree}, nil
}
