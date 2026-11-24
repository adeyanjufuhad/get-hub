package questions

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/adeyanjufuhad/get-hub/backend/internal/db/sqlc"
)

func TestPublicQuestionNeverLeaksAnswersOrSolutions(t *testing.T) {
	q := sqlc.Question{
		ID:                  uuid.New(),
		CourseID:            uuid.New(),
		TopicID:             uuid.New(),
		QuestionType:        "mcq",
		PromptMd:            "What is $2+2$?",
		NumericAnswer:       pgtype.Float8{Float64: 4, Valid: true},
		NumericTolerancePct: 1.0,
		SolutionMd:          "SECRET_SOLUTION_TEXT",
		Difficulty:          "easy",
		Tags:                []string{"math"},
		Source:              "original",
		Status:              "published",
		IsFree:              true,
	}
	opts := []sqlc.QuestionOption{
		{ID: uuid.New(), QuestionID: q.ID, Label: "A", ContentMd: "4", IsCorrect: true, DisplayOrder: 1},
		{ID: uuid.New(), QuestionID: q.ID, Label: "B", ContentMd: "5", IsCorrect: false, DisplayOrder: 2},
	}

	pub := ToPublic(q, opts)
	raw, err := json.Marshal(pub)
	if err != nil {
		t.Fatalf("marshal failed: %v", err)
	}
	body := string(raw)

	for _, forbidden := range []string{"is_correct", "numeric_answer", "solution_md", "SECRET_SOLUTION_TEXT"} {
		if strings.Contains(body, forbidden) {
			t.Fatalf("PublicQuestion JSON leaked %q: %s", forbidden, body)
		}
	}
}

func TestSaveQuestionImageRejectsUnsafeSVG(t *testing.T) {
	dir := t.TempDir()
	evil := `<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`
	if _, err := SaveQuestionImage(dir, "bad.svg", strings.NewReader(evil)); err != ErrUnsafeSVG {
		t.Fatalf("expected ErrUnsafeSVG, got %v", err)
	}

	safe := `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>`
	rel, err := SaveQuestionImage(dir, "good.svg", strings.NewReader(safe))
	if err != nil || !strings.HasPrefix(rel, "/uploads/") || !strings.HasSuffix(rel, ".svg") {
		t.Fatalf("expected valid svg upload path, got rel=%q err=%v", rel, err)
	}
}
