package handlers

import (
	"errors"
	"net/http"
	"time"

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

type ExamsHandler struct {
	queries *sqlc.Queries
	cfg     config.Config
	policy  access.Policy
}

func NewExamsHandler(queries *sqlc.Queries, cfg config.Config, policy access.Policy) *ExamsHandler {
	return &ExamsHandler{queries: queries, cfg: cfg, policy: policy}
}

type startExamRequest struct {
	QuestionCount   int32 `json:"question_count"`
	DurationSeconds int32 `json:"duration_seconds"`
}

func (h *ExamsHandler) Start(w http.ResponseWriter, r *http.Request) {
	id, ok := auth.FromContext(r.Context())
	if !ok {
		httpapi.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication required.")
		return
	}

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

	var req startExamRequest
	if r.Body != nil && r.ContentLength > 0 {
		_ = httpapi.DecodeJSON(w, r, &req)
	}
	if req.QuestionCount <= 0 || req.QuestionCount > 40 {
		req.QuestionCount = 10
	}
	if req.DurationSeconds < 60 || req.DurationSeconds > 7200 {
		req.DurationSeconds = req.QuestionCount * 90 // 1.5 mins per question default
	}

	qs, err := h.queries.ListQuestionsByCourseRandom(r.Context(), course.ID, h.cfg.IncludeDraftContent, req.QuestionCount)
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not assemble mock exam.")
		return
	}
	if len(qs) == 0 {
		httpapi.WriteError(w, http.StatusUnprocessableEntity, "NO_QUESTIONS", "No questions are available for this course yet.")
		return
	}

	qIDs := make([]uuid.UUID, 0, len(qs))
	for _, q := range qs {
		qIDs = append(qIDs, q.ID)
	}

	exam, err := h.queries.CreateMockExam(r.Context(), sqlc.CreateMockExamParams{
		UserID:          id.UserID,
		CourseID:        course.ID,
		QuestionIds:     qIDs,
		DurationSeconds: req.DurationSeconds,
		TotalQuestions:  int32(len(qs)),
	})
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not create mock exam.")
		return
	}

	optsByQ := h.loadOptionsMap(r, qIDs)
	publicQs := make([]questions.PublicQuestion, 0, len(qs))
	for _, q := range qs {
		publicQs = append(publicQs, questions.ToPublic(q, optsByQ[q.ID]))
	}

	httpapi.WriteJSON(w, http.StatusCreated, map[string]any{
		"exam":      exam,
		"course":    course,
		"questions": publicQs,
	})
}

func (h *ExamsHandler) ListMine(w http.ResponseWriter, r *http.Request) {
	id, ok := auth.FromContext(r.Context())
	if !ok {
		httpapi.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication required.")
		return
	}

	exams, err := h.queries.ListMockExamsByUser(r.Context(), id.UserID)
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load mock exams.")
		return
	}

	httpapi.WriteJSON(w, http.StatusOK, map[string]any{"exams": exams})
}

type TopicBreakdownItem struct {
	TopicID    uuid.UUID `json:"topic_id"`
	TopicTitle string    `json:"topic_title"`
	TopicSlug  string    `json:"topic_slug"`
	Correct    int       `json:"correct"`
	Total      int       `json:"total"`
	Accuracy   int       `json:"accuracy_pct"`
}

type GradedQuestionReview struct {
	Question            questions.PublicQuestion `json:"question"`
	SelectedOptionID    *uuid.UUID               `json:"selected_option_id,omitempty"`
	NumericInput        *float64                 `json:"numeric_input,omitempty"`
	IsCorrect           bool                     `json:"is_correct"`
	CorrectOptionID     *uuid.UUID               `json:"correct_option_id,omitempty"`
	NumericAnswer       *float64                 `json:"numeric_answer,omitempty"`
	NumericTolerancePct float64                  `json:"numeric_tolerance_pct,omitempty"`
	SolutionMD          string                   `json:"solution_md"`
}

func (h *ExamsHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, ok := auth.FromContext(r.Context())
	if !ok {
		httpapi.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication required.")
		return
	}
	examID, err := uuid.Parse(chi.URLParam(r, "examId"))
	if err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_ID", "Invalid mock exam ID.")
		return
	}

	exam, err := h.queries.GetMockExamByIDForUser(r.Context(), examID, id.UserID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			httpapi.WriteError(w, http.StatusNotFound, "NOT_FOUND", "Mock exam not found.")
			return
		}
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load mock exam.")
		return
	}

	course, _ := h.queries.GetCourseByID(r.Context(), exam.CourseID)
	orderedQs, optsByQ, err := h.loadOrderedQuestions(r, exam.QuestionIds)
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load exam questions.")
		return
	}

	// If not submitted yet, NEVER leak solutions or correct options.
	if !exam.SubmittedAt.Valid {
		publicQs := make([]questions.PublicQuestion, 0, len(orderedQs))
		for _, q := range orderedQs {
			publicQs = append(publicQs, questions.ToPublic(q, optsByQ[q.ID]))
		}
		remaining := int(time.Until(exam.StartedAt.Add(time.Duration(exam.DurationSeconds) * time.Second)).Seconds())
		if remaining < 0 {
			remaining = 0
		}
		httpapi.WriteJSON(w, http.StatusOK, map[string]any{
			"exam":              exam,
			"course":            course,
			"questions":         publicQs,
			"remaining_seconds": remaining,
		})
		return
	}

	// Submitted: include server-graded breakdown & full solutions.
	answers, err := h.queries.ListMockExamAnswers(r.Context(), exam.ID)
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load exam answers.")
		return
	}
	reviews, breakdown := h.buildExamReview(r, orderedQs, optsByQ, answers)

	httpapi.WriteJSON(w, http.StatusOK, map[string]any{
		"exam":            exam,
		"course":          course,
		"reviews":         reviews,
		"topic_breakdown": breakdown,
	})
}

type examAnswerInput struct {
	QuestionID       uuid.UUID  `json:"question_id"`
	SelectedOptionID *uuid.UUID `json:"selected_option_id"`
	NumericInput     *float64   `json:"numeric_input"`
}

type submitExamRequest struct {
	Answers []examAnswerInput `json:"answers"`
}

func (h *ExamsHandler) Submit(w http.ResponseWriter, r *http.Request) {
	id, ok := auth.FromContext(r.Context())
	if !ok {
		httpapi.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication required.")
		return
	}
	examID, err := uuid.Parse(chi.URLParam(r, "examId"))
	if err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_ID", "Invalid mock exam ID.")
		return
	}

	exam, err := h.queries.GetMockExamByIDForUser(r.Context(), examID, id.UserID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			httpapi.WriteError(w, http.StatusNotFound, "NOT_FOUND", "Mock exam not found.")
			return
		}
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load mock exam.")
		return
	}
	if exam.SubmittedAt.Valid {
		httpapi.WriteError(w, http.StatusConflict, "ALREADY_SUBMITTED", "This mock exam has already been submitted.")
		return
	}

	var req submitExamRequest
	if err := httpapi.DecodeJSON(w, r, &req); err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_JSON", "Invalid request body.")
		return
	}

	inputByQ := make(map[uuid.UUID]examAnswerInput, len(req.Answers))
	for _, a := range req.Answers {
		inputByQ[a.QuestionID] = a
	}

	orderedQs, optsByQ, err := h.loadOrderedQuestions(r, exam.QuestionIds)
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not grade exam questions.")
		return
	}

	var score int32
	savedAnswers := make([]sqlc.MockExamAnswer, 0, len(orderedQs))

	for _, q := range orderedQs {
		ansIn, answered := inputByQ[q.ID]
		var (
			isCorrect bool
			selOpt    pgtype.UUID
			numIn     pgtype.Float8
		)

		if answered {
			switch q.QuestionType {
			case "mcq":
				if ansIn.SelectedOptionID != nil {
					opts := optsByQ[q.ID]
					gradingOpts := make([]questions.OptionForGrading, 0, len(opts))
					for _, o := range opts {
						gradingOpts = append(gradingOpts, questions.OptionForGrading{ID: o.ID, IsCorrect: o.IsCorrect})
					}
					if okChoice, _, err := questions.CheckMCQ(gradingOpts, ansIn.SelectedOptionID); err == nil {
						isCorrect = okChoice
						selOpt = pgtype.UUID{Bytes: *ansIn.SelectedOptionID, Valid: true}
					}
				}
			case "numeric":
				if ansIn.SelectedOptionID != nil && q.NumericAnswer.Valid {
					synth := questions.SynthesizeMCQ(q)
					if chosen, _ := questions.MatchSyntheticOption(synth, ansIn.SelectedOptionID); chosen != nil {
						isCorrect = chosen.IsCorrect
						numIn = pgtype.Float8{Float64: chosen.Value, Valid: true}
					}
				} else if ansIn.NumericInput != nil && q.NumericAnswer.Valid {
					if okNum, err := questions.CheckNumeric(q.NumericAnswer.Float64, q.NumericTolerancePct, ansIn.NumericInput); err == nil {
						isCorrect = okNum
						numIn = pgtype.Float8{Float64: *ansIn.NumericInput, Valid: true}
					}
				}
			}
		}

		if isCorrect {
			score++
		}

		saved, err := h.queries.UpsertMockExamAnswer(r.Context(), sqlc.UpsertMockExamAnswerParams{
			MockExamID:       exam.ID,
			QuestionID:       q.ID,
			SelectedOptionID: selOpt,
			NumericInput:     numIn,
			IsCorrect:        pgtype.Bool{Bool: isCorrect, Valid: true},
		})
		if err != nil {
			httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not store graded answers.")
			return
		}
		savedAnswers = append(savedAnswers, saved)

		// Also record in attempts table so topic accuracy & weak topics reflect mock exams.
		if selOpt.Valid || numIn.Valid {
			_, _ = h.queries.CreateAttempt(r.Context(), sqlc.CreateAttemptParams{
				UserID:           id.UserID,
				QuestionID:       q.ID,
				TopicID:          q.TopicID,
				SelectedOptionID: selOpt,
				NumericInput:     numIn,
				IsCorrect:        isCorrect,
				TimeTakenMs:      0,
			})
		}
	}

	gradedExam, err := h.queries.SubmitMockExam(r.Context(), exam.ID, id.UserID, score)
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not finalize mock exam.")
		return
	}

	course, _ := h.queries.GetCourseByID(r.Context(), gradedExam.CourseID)
	reviews, breakdown := h.buildExamReview(r, orderedQs, optsByQ, savedAnswers)

	httpapi.WriteJSON(w, http.StatusOK, map[string]any{
		"exam":            gradedExam,
		"course":          course,
		"reviews":         reviews,
		"topic_breakdown": breakdown,
	})
}

func (h *ExamsHandler) loadOptionsMap(r *http.Request, qIDs []uuid.UUID) map[uuid.UUID][]sqlc.QuestionOption {
	optsByQ := make(map[uuid.UUID][]sqlc.QuestionOption)
	if len(qIDs) == 0 {
		return optsByQ
	}
	allOpts, err := h.queries.ListQuestionOptionsByQuestionIDs(r.Context(), qIDs)
	if err != nil {
		return optsByQ
	}
	for _, o := range allOpts {
		optsByQ[o.QuestionID] = append(optsByQ[o.QuestionID], o)
	}
	return optsByQ
}

func (h *ExamsHandler) loadOrderedQuestions(r *http.Request, qIDs []uuid.UUID) ([]sqlc.Question, map[uuid.UUID][]sqlc.QuestionOption, error) {
	qs, err := h.queries.ListQuestionsByIDs(r.Context(), qIDs)
	if err != nil {
		return nil, nil, err
	}
	byID := make(map[uuid.UUID]sqlc.Question, len(qs))
	for _, q := range qs {
		byID[q.ID] = q
	}
	ordered := make([]sqlc.Question, 0, len(qIDs))
	for _, qid := range qIDs {
		if q, ok := byID[qid]; ok {
			ordered = append(ordered, q)
		}
	}
	return ordered, h.loadOptionsMap(r, qIDs), nil
}

func (h *ExamsHandler) buildExamReview(
	r *http.Request,
	orderedQs []sqlc.Question,
	optsByQ map[uuid.UUID][]sqlc.QuestionOption,
	answers []sqlc.MockExamAnswer,
) ([]GradedQuestionReview, []TopicBreakdownItem) {
	ansByQ := make(map[uuid.UUID]sqlc.MockExamAnswer, len(answers))
	for _, a := range answers {
		ansByQ[a.QuestionID] = a
	}

	topicCache := make(map[uuid.UUID]sqlc.Topic)
	breakdownMap := make(map[uuid.UUID]*TopicBreakdownItem)
	breakdownOrder := make([]uuid.UUID, 0)

	reviews := make([]GradedQuestionReview, 0, len(orderedQs))
	for _, q := range orderedQs {
		opts := optsByQ[q.ID]
		ans := ansByQ[q.ID]

		rev := GradedQuestionReview{
			Question:            questions.ToPublic(q, opts),
			IsCorrect:           ans.IsCorrect.Valid && ans.IsCorrect.Bool,
			NumericTolerancePct: q.NumericTolerancePct,
			SolutionMD:          q.SolutionMd,
		}
		if ans.SelectedOptionID.Valid {
			u := uuid.UUID(ans.SelectedOptionID.Bytes)
			rev.SelectedOptionID = &u
		}
		if ans.NumericInput.Valid {
			v := ans.NumericInput.Float64
			rev.NumericInput = &v
		}
		if q.QuestionType == "mcq" {
			for _, o := range opts {
				if o.IsCorrect {
					cid := o.ID
					rev.CorrectOptionID = &cid
					break
				}
			}
		} else if q.NumericAnswer.Valid {
			synth := questions.SynthesizeMCQ(q)
			_, cid := questions.MatchSyntheticOption(synth, nil)
			if cid != uuid.Nil {
				rev.CorrectOptionID = &cid
			}
			if ans.NumericInput.Valid {
				rev.SelectedOptionID = questions.MatchSyntheticByValue(synth, ans.NumericInput.Float64, q.NumericTolerancePct)
			}
		}
		reviews = append(reviews, rev)

		tb, exists := breakdownMap[q.TopicID]
		if !exists {
			t, ok := topicCache[q.TopicID]
			if !ok {
				if fetched, err := h.queries.GetTopicByID(r.Context(), q.TopicID); err == nil {
					t = fetched
					topicCache[q.TopicID] = fetched
				}
			}
			tb = &TopicBreakdownItem{
				TopicID:    q.TopicID,
				TopicTitle: t.Title,
				TopicSlug:  t.Slug,
			}
			breakdownMap[q.TopicID] = tb
			breakdownOrder = append(breakdownOrder, q.TopicID)
		}
		tb.Total++
		if rev.IsCorrect {
			tb.Correct++
		}
	}

	breakdown := make([]TopicBreakdownItem, 0, len(breakdownOrder))
	for _, tid := range breakdownOrder {
		tb := breakdownMap[tid]
		if tb.Total > 0 {
			tb.Accuracy = (tb.Correct * 100) / tb.Total
		}
		breakdown = append(breakdown, *tb)
	}
	return reviews, breakdown
}
