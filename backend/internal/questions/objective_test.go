package questions

import (
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/adeyanjufuhad/get-hub/backend/internal/db/sqlc"
)

func TestSynthesizeMCQProducesFourDistinctObjectiveOptions(t *testing.T) {
	cases := []struct {
		name string
		ans  float64
		unit string
	}{
		{"positive pressure", 101.24, "kPa"},
		{"zero limit", 0, ""},
		{"small int degree", 2, ""},
		{"negative determinant", -26, ""},
		{"large momentum", 2840000, "kg·m/s"},
		{"small decimal volume", 0.09, "in^3"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			q := sqlc.Question{
				ID:            uuid.New(),
				QuestionType:  "numeric",
				PromptMd:      "Determine the value.",
				NumericAnswer: pgtype.Float8{Float64: tc.ans, Valid: true},
				NumericUnit:   tc.unit,
			}
			opts := SynthesizeMCQ(q)
			if len(opts) != 4 {
				t.Fatalf("expected 4 options, got %d", len(opts))
			}
			correctCount := 0
			seenText := map[string]bool{}
			for i, o := range opts {
				if seenText[o.ContentMD] {
					t.Fatalf("duplicate option text %q", o.ContentMD)
				}
				seenText[o.ContentMD] = true
				if o.IsCorrect {
					correctCount++
				}
				if i > 0 && o.Value < opts[i-1].Value {
					t.Fatalf("options not sorted ascending: %v", opts)
				}
			}
			if correctCount != 1 {
				t.Fatalf("expected 1 correct option, got %d", correctCount)
			}

			// Deterministic across calls
			opts2 := SynthesizeMCQ(q)
			for i := range opts {
				if opts[i].ID != opts2[i].ID || opts[i].ContentMD != opts2[i].ContentMD {
					t.Fatalf("SynthesizeMCQ is not deterministic")
				}
			}
		})
	}
}
