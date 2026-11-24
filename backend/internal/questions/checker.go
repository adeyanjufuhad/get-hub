package questions

import (
	"errors"
	"math"

	"github.com/google/uuid"
)

var (
	ErrMissingAnswer  = errors.New("answer is required")
	ErrInvalidNumeric = errors.New("numeric answer must be a finite number")
)

// OptionForGrading carries minimal option info needed on the server to grade an MCQ.
type OptionForGrading struct {
	ID        uuid.UUID
	IsCorrect bool
}

// CheckMCQ grades an MCQ submission strictly on the server.
func CheckMCQ(options []OptionForGrading, selectedOptionID *uuid.UUID) (bool, uuid.UUID, error) {
	if selectedOptionID == nil || *selectedOptionID == uuid.Nil {
		return false, uuid.Nil, ErrMissingAnswer
	}

	var correctID uuid.UUID
	var validChoice bool
	for _, opt := range options {
		if opt.IsCorrect {
			correctID = opt.ID
		}
		if opt.ID == *selectedOptionID {
			validChoice = true
		}
	}
	if !validChoice {
		return false, correctID, errors.New("selected option does not belong to this question")
	}

	return *selectedOptionID == correctID && correctID != uuid.Nil, correctID, nil
}

// CheckNumeric grades a numeric answer against the expected value using a percentage tolerance
// (e.g. tolerancePct = 1.0 means ±1%). When expected == 0, an absolute tolerance of 1e-4 is used.
func CheckNumeric(expected float64, tolerancePct float64, submitted *float64) (bool, error) {
	if submitted == nil {
		return false, ErrMissingAnswer
	}
	val := *submitted
	if math.IsNaN(val) || math.IsInf(val, 0) {
		return false, ErrInvalidNumeric
	}
	if tolerancePct < 0 {
		tolerancePct = 0
	}

	diff := math.Abs(val - expected)
	if expected == 0 {
		return diff <= 1e-4, nil
	}

	allowed := math.Abs(expected) * (tolerancePct / 100.0)
	// Add tiny floating-point epsilon so exact boundary values like 101.0 for 100±1% pass cleanly.
	epsilon := 1e-9 * math.Max(1.0, math.Abs(expected))
	return diff <= allowed+epsilon, nil
}
