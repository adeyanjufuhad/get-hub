package questions

import (
	"github.com/google/uuid"

	"github.com/adeyanjufuhad/get-hub/backend/internal/db/sqlc"
)

// PublicOption NEVER exposes is_correct to the browser prior to submission.
type PublicOption struct {
	ID           uuid.UUID `json:"id"`
	Label        string    `json:"label"`
	ContentMD    string    `json:"content_md"`
	ImageURL     *string   `json:"image_url,omitempty"`
	DisplayOrder int32     `json:"display_order"`
}

// PublicQuestion NEVER exposes numeric_answer or solution_md prior to submission.
type PublicQuestion struct {
	ID                  uuid.UUID      `json:"id"`
	CourseID            uuid.UUID      `json:"course_id"`
	TopicID             uuid.UUID      `json:"topic_id"`
	QuestionType        string         `json:"question_type"`
	PromptMD            string         `json:"prompt_md"`
	PromptImageURL      *string        `json:"prompt_image_url,omitempty"`
	NumericTolerancePct float64        `json:"numeric_tolerance_pct,omitempty"`
	NumericUnit         string         `json:"numeric_unit,omitempty"`
	Difficulty          string         `json:"difficulty"`
	Tags                []string       `json:"tags"`
	Source              string         `json:"source"`
	Year                *int32         `json:"year,omitempty"`
	Status              string         `json:"status"`
	IsFree              bool           `json:"is_free"`
	Options             []PublicOption `json:"options,omitempty"`
}

// ToPublic converts a DB Question + Options into a strictly sanitized client DTO.
func ToPublic(q sqlc.Question, opts []sqlc.QuestionOption) PublicQuestion {
	pq := PublicQuestion{
		ID:           q.ID,
		CourseID:     q.CourseID,
		TopicID:      q.TopicID,
		QuestionType: q.QuestionType,
		PromptMD:     q.PromptMd,
		NumericUnit:  q.NumericUnit,
		Difficulty:   q.Difficulty,
		Tags:         q.Tags,
		Source:       q.Source,
		Status:       q.Status,
		IsFree:       q.IsFree,
	}
	if q.QuestionType == "numeric" && len(opts) == 0 && q.NumericAnswer.Valid {
		// Present legacy numeric rows as objective 4-option MCQs so all quizzes
		// stay objective even before DB migrations/re-seeding run.
		synth := SynthesizeMCQ(q)
		pq.QuestionType = "mcq"
		pq.NumericTolerancePct = 0
		pq.Options = make([]PublicOption, 0, len(synth))
		for _, o := range synth {
			pq.Options = append(pq.Options, PublicOption{
				ID:           o.ID,
				Label:        o.Label,
				ContentMD:    o.ContentMD,
				DisplayOrder: o.DisplayOrder,
			})
		}
	} else if q.QuestionType == "numeric" {
		pq.NumericTolerancePct = q.NumericTolerancePct
	}
	if q.PromptImageUrl.Valid && q.PromptImageUrl.String != "" {
		u := q.PromptImageUrl.String
		pq.PromptImageURL = &u
	}
	if q.Year.Valid {
		y := q.Year.Int32
		pq.Year = &y
	}
	if len(opts) > 0 {
		pq.Options = make([]PublicOption, 0, len(opts))
		for _, o := range opts {
			po := PublicOption{
				ID:           o.ID,
				Label:        o.Label,
				ContentMD:    o.ContentMd,
				DisplayOrder: o.DisplayOrder,
			}
			if o.ImageUrl.Valid && o.ImageUrl.String != "" {
				u := o.ImageUrl.String
				po.ImageURL = &u
			}
			pq.Options = append(pq.Options, po)
		}
	}
	return pq
}
