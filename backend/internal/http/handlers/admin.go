package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/adeyanjufuhad/get-hub/backend/internal/auth"
	"github.com/adeyanjufuhad/get-hub/backend/internal/config"
	"github.com/adeyanjufuhad/get-hub/backend/internal/db/sqlc"
	httpapi "github.com/adeyanjufuhad/get-hub/backend/internal/http"
	"github.com/adeyanjufuhad/get-hub/backend/internal/questions"
)

type AdminHandler struct {
	queries *sqlc.Queries
	cfg     config.Config
}

func NewAdminHandler(queries *sqlc.Queries, cfg config.Config) *AdminHandler {
	return &AdminHandler{queries: queries, cfg: cfg}
}

type AdminQuestionWithOptions struct {
	sqlc.AdminQuestionRow
	Options []sqlc.QuestionOption `json:"options"`
}

func (h *AdminHandler) ListMetadata(w http.ResponseWriter, r *http.Request) {
	courses, err := h.queries.ListActiveCourses(r.Context())
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load courses.")
		return
	}
	topics, err := h.queries.ListAllTopicsWithCourse(r.Context())
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load topics.")
		return
	}
	httpapi.WriteJSON(w, http.StatusOK, map[string]any{
		"courses": courses,
		"topics":  topics,
	})
}

func (h *AdminHandler) ListQuestions(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	var courseID, topicID pgtype.UUID

	if raw := strings.TrimSpace(q.Get("course_id")); raw != "" {
		if id, err := uuid.Parse(raw); err == nil {
			courseID = pgtype.UUID{Bytes: id, Valid: true}
		}
	}
	if raw := strings.TrimSpace(q.Get("topic_id")); raw != "" {
		if id, err := uuid.Parse(raw); err == nil {
			topicID = pgtype.UUID{Bytes: id, Valid: true}
		}
	}

	status := strings.TrimSpace(q.Get("status"))
	if status != "draft" && status != "published" {
		status = ""
	}

	limit := int32(50)
	if n, err := strconv.Atoi(q.Get("limit")); err == nil && n > 0 && n <= 100 {
		limit = int32(n)
	}
	offset := int32(0)
	if n, err := strconv.Atoi(q.Get("offset")); err == nil && n >= 0 {
		offset = int32(n)
	}

	rows, err := h.queries.AdminListQuestions(r.Context(), sqlc.AdminListQuestionsParams{
		CourseID: courseID,
		TopicID:  topicID,
		Status:   status,
		Limit:    limit,
		Offset:   offset,
	})
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not list questions.")
		return
	}

	qIDs := make([]uuid.UUID, 0, len(rows))
	for _, row := range rows {
		qIDs = append(qIDs, row.ID)
	}

	optsByQ := make(map[uuid.UUID][]sqlc.QuestionOption)
	if len(qIDs) > 0 {
		allOpts, err := h.queries.ListQuestionOptionsByQuestionIDs(r.Context(), qIDs)
		if err == nil {
			for _, o := range allOpts {
				optsByQ[o.QuestionID] = append(optsByQ[o.QuestionID], o)
			}
		}
	}

	out := make([]AdminQuestionWithOptions, 0, len(rows))
	for _, row := range rows {
		opts := optsByQ[row.ID]
		if opts == nil {
			opts = []sqlc.QuestionOption{}
		}
		out = append(out, AdminQuestionWithOptions{
			AdminQuestionRow: row,
			Options:          opts,
		})
	}

	httpapi.WriteJSON(w, http.StatusOK, map[string]any{"questions": out})
}

type adminOptionInput struct {
	Label     string `json:"label"`
	ContentMD string `json:"content_md"`
	ImageURL  string `json:"image_url"`
	IsCorrect bool   `json:"is_correct"`
}

type adminUpsertQuestionRequest struct {
	CourseID            uuid.UUID          `json:"course_id"`
	TopicID             uuid.UUID          `json:"topic_id"`
	QuestionType        string             `json:"question_type"`
	PromptMD            string             `json:"prompt_md"`
	PromptImageURL      string             `json:"prompt_image_url"`
	NumericAnswer       *float64           `json:"numeric_answer"`
	NumericTolerancePct float64            `json:"numeric_tolerance_pct"`
	NumericUnit         string             `json:"numeric_unit"`
	SolutionMD          string             `json:"solution_md"`
	Difficulty          string             `json:"difficulty"`
	Tags                []string           `json:"tags"`
	Source              string             `json:"source"`
	Year                *int32             `json:"year"`
	Status              string             `json:"status"`
	IsFree              bool               `json:"is_free"`
	Options             []adminOptionInput `json:"options"`
}

func (h *AdminHandler) CreateQuestion(w http.ResponseWriter, r *http.Request) {
	id, _ := auth.FromContext(r.Context())

	var req adminUpsertQuestionRequest
	if err := httpapi.DecodeJSON(w, r, &req); err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_JSON", "Invalid JSON payload.")
		return
	}
	if fields := validateAdminQuestion(&req); len(fields) > 0 {
		httpapi.WriteValidationError(w, "Please fix the invalid question fields.", fields)
		return
	}

	q, err := h.queries.CreateQuestion(r.Context(), buildUpsertParams(uuid.Nil, id.UserID, req))
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not create question.")
		return
	}

	opts, err := h.replaceOptions(r, q.ID, req)
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Question saved, but failed to store options.")
		return
	}

	httpapi.WriteJSON(w, http.StatusCreated, map[string]any{"question": q, "options": opts})
}

func (h *AdminHandler) UpdateQuestion(w http.ResponseWriter, r *http.Request) {
	id, _ := auth.FromContext(r.Context())
	qid, err := uuid.Parse(chi.URLParam(r, "questionId"))
	if err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_ID", "Invalid question ID.")
		return
	}

	var req adminUpsertQuestionRequest
	if err := httpapi.DecodeJSON(w, r, &req); err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_JSON", "Invalid JSON payload.")
		return
	}
	if fields := validateAdminQuestion(&req); len(fields) > 0 {
		httpapi.WriteValidationError(w, "Please fix the invalid question fields.", fields)
		return
	}

	q, err := h.queries.UpdateQuestion(r.Context(), buildUpsertParams(qid, id.UserID, req))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			httpapi.WriteError(w, http.StatusNotFound, "NOT_FOUND", "Question not found.")
			return
		}
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not update question.")
		return
	}

	opts, err := h.replaceOptions(r, q.ID, req)
	if err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not update options.")
		return
	}

	httpapi.WriteJSON(w, http.StatusOK, map[string]any{"question": q, "options": opts})
}

type updateStatusRequest struct {
	Status string `json:"status"`
}

func (h *AdminHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	qid, err := uuid.Parse(chi.URLParam(r, "questionId"))
	if err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_ID", "Invalid question ID.")
		return
	}
	var req updateStatusRequest
	if err := httpapi.DecodeJSON(w, r, &req); err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_JSON", "Invalid JSON payload.")
		return
	}
	if req.Status != "draft" && req.Status != "published" {
		httpapi.WriteValidationError(w, "Invalid status.", map[string]string{"status": "Must be 'draft' or 'published'."})
		return
	}

	q, err := h.queries.UpdateQuestionStatus(r.Context(), qid, req.Status)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			httpapi.WriteError(w, http.StatusNotFound, "NOT_FOUND", "Question not found.")
			return
		}
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not update question status.")
		return
	}
	httpapi.WriteJSON(w, http.StatusOK, map[string]any{"question": q})
}

func (h *AdminHandler) DeleteQuestion(w http.ResponseWriter, r *http.Request) {
	qid, err := uuid.Parse(chi.URLParam(r, "questionId"))
	if err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_ID", "Invalid question ID.")
		return
	}
	if err := h.queries.DeleteQuestion(r.Context(), qid); err != nil {
		httpapi.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not delete question.")
		return
	}
	httpapi.WriteJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (h *AdminHandler) UploadImage(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, questions.MaxUploadBytes+64*1024)
	if err := r.ParseMultipartForm(questions.MaxUploadBytes); err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "UPLOAD_ERROR", "File must be under 512 KB.")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "MISSING_FILE", "Form field 'file' is required.")
		return
	}
	defer file.Close()

	relPath, err := questions.SaveQuestionImage(h.cfg.UploadDir, header.Filename, file)
	if err != nil {
		httpapi.WriteError(w, http.StatusBadRequest, "INVALID_IMAGE", err.Error())
		return
	}

	httpapi.WriteJSON(w, http.StatusCreated, map[string]any{
		"url": h.cfg.APIPublicURL + relPath,
		"path": relPath,
	})
}

func (h *AdminHandler) replaceOptions(r *http.Request, questionID uuid.UUID, req adminUpsertQuestionRequest) ([]sqlc.QuestionOption, error) {
	if err := h.queries.DeleteQuestionOptions(r.Context(), questionID); err != nil {
		return nil, err
	}
	if req.QuestionType != "mcq" {
		return []sqlc.QuestionOption{}, nil
	}

	saved := make([]sqlc.QuestionOption, 0, len(req.Options))
	for idx, o := range req.Options {
		var img pgtype.Text
		if strings.TrimSpace(o.ImageURL) != "" {
			img = pgtype.Text{String: strings.TrimSpace(o.ImageURL), Valid: true}
		}
		opt, err := h.queries.CreateQuestionOption(r.Context(), sqlc.CreateQuestionOptionParams{
			QuestionID:   questionID,
			Label:        strings.ToUpper(strings.TrimSpace(o.Label)),
			ContentMd:    strings.TrimSpace(o.ContentMD),
			ImageUrl:     img,
			IsCorrect:    o.IsCorrect,
			DisplayOrder: int32(idx + 1),
		})
		if err != nil {
			return nil, err
		}
		saved = append(saved, opt)
	}
	return saved, nil
}

func validateAdminQuestion(req *adminUpsertQuestionRequest) map[string]string {
	fields := make(map[string]string)
	if req.CourseID == uuid.Nil {
		fields["course_id"] = "Select a course."
	}
	if req.TopicID == uuid.Nil {
		fields["topic_id"] = "Select a topic."
	}
	if strings.TrimSpace(req.PromptMD) == "" {
		fields["prompt_md"] = "Question prompt is required."
	}
	if strings.TrimSpace(req.SolutionMD) == "" {
		fields["solution_md"] = "Step-by-step solution is required."
	}
	if req.Difficulty != "easy" && req.Difficulty != "medium" && req.Difficulty != "hard" {
		req.Difficulty = "medium"
	}
	if req.Source != "original" && req.Source != "past-question" {
		req.Source = "original"
	}
	if req.Status != "draft" && req.Status != "published" {
		req.Status = "draft"
	}
	if req.NumericTolerancePct <= 0 {
		req.NumericTolerancePct = 1.0
	}

	switch req.QuestionType {
	case "mcq":
		if len(req.Options) != 4 {
			fields["options"] = "MCQ questions must have exactly 4 options (A–D)."
		} else {
			correctCount := 0
			for _, o := range req.Options {
				if o.IsCorrect {
					correctCount++
				}
				if strings.TrimSpace(o.ContentMD) == "" && strings.TrimSpace(o.ImageURL) == "" {
					fields["options"] = "Every option must have text/KaTeX or an image."
				}
			}
			if correctCount != 1 {
				fields["options"] = "Exactly one MCQ option must be marked correct."
			}
		}
	case "numeric":
		if req.NumericAnswer == nil {
			fields["numeric_answer"] = "Numeric answer is required for numeric questions."
		}
	default:
		fields["question_type"] = "Must be 'mcq' or 'numeric'."
	}

	return fields
}

func buildUpsertParams(questionID, createdBy uuid.UUID, req adminUpsertQuestionRequest) sqlc.UpsertQuestionParams {
	var promptImg pgtype.Text
	if strings.TrimSpace(req.PromptImageURL) != "" {
		promptImg = pgtype.Text{String: strings.TrimSpace(req.PromptImageURL), Valid: true}
	}
	var numAns pgtype.Float8
	if req.NumericAnswer != nil {
		numAns = pgtype.Float8{Float64: *req.NumericAnswer, Valid: true}
	}
	var yr pgtype.Int4
	if req.Year != nil && *req.Year > 1950 && *req.Year < 2100 {
		yr = pgtype.Int4{Int32: *req.Year, Valid: true}
	}
	tags := req.Tags
	if tags == nil {
		tags = []string{}
	}
	return sqlc.UpsertQuestionParams{
		ID:                  questionID,
		CourseID:            req.CourseID,
		TopicID:             req.TopicID,
		QuestionType:        req.QuestionType,
		PromptMd:            strings.TrimSpace(req.PromptMD),
		PromptImageUrl:      promptImg,
		NumericAnswer:       numAns,
		NumericTolerancePct: req.NumericTolerancePct,
		NumericUnit:         strings.TrimSpace(req.NumericUnit),
		SolutionMd:          strings.TrimSpace(req.SolutionMD),
		Difficulty:          req.Difficulty,
		Tags:                tags,
		Source:              req.Source,
		Year:                yr,
		Status:              req.Status,
		IsFree:              req.IsFree,
		CreatedBy:           pgtype.UUID{Bytes: createdBy, Valid: createdBy != uuid.Nil},
	}
}
