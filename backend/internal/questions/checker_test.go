package questions

import (
	"math"
	"testing"

	"github.com/google/uuid"
)

func TestCheckMCQ(t *testing.T) {
	optA := uuid.New()
	optB := uuid.New()
	optC := uuid.New()
	opts := []OptionForGrading{
		{ID: optA, IsCorrect: false},
		{ID: optB, IsCorrect: true},
		{ID: optC, IsCorrect: false},
	}

	// Correct choice
	ok, correctID, err := CheckMCQ(opts, &optB)
	if err != nil || !ok || correctID != optB {
		t.Fatalf("expected correct match, got ok=%v correctID=%v err=%v", ok, correctID, err)
	}

	// Incorrect choice
	ok, correctID, err = CheckMCQ(opts, &optA)
	if err != nil || ok || correctID != optB {
		t.Fatalf("expected incorrect match returning correctID, got ok=%v correctID=%v err=%v", ok, correctID, err)
	}

	// Option belonging to another question must error
	foreign := uuid.New()
	if _, _, err := CheckMCQ(opts, &foreign); err == nil {
		t.Fatalf("expected error for foreign option id")
	}

	// Nil selection must error
	if _, _, err := CheckMCQ(opts, nil); err != ErrMissingAnswer {
		t.Fatalf("expected ErrMissingAnswer, got %v", err)
	}
}

func TestCheckNumericTolerance(t *testing.T) {
	ptr := func(v float64) *float64 { return &v }

	cases := []struct {
		name      string
		expected  float64
		tolPct    float64
		submitted *float64
		wantOK    bool
		wantErr   bool
	}{
		{"exact match", 65.53, 1.0, ptr(65.53), true, false},
		{"upper boundary +1%", 100.0, 1.0, ptr(101.0), true, false},
		{"lower boundary -1%", 100.0, 1.0, ptr(99.0), true, false},
		{"slightly above +1%", 100.0, 1.0, ptr(101.01), false, false},
		{"slightly below -1%", 100.0, 1.0, ptr(98.99), false, false},
		{"GET 203 plan length rounding", 65.53, 1.0, ptr(65.5), true, false},
		{"negative answer inside tolerance", -25.0, 2.0, ptr(-25.49), true, false},
		{"negative answer outside tolerance", -25.0, 2.0, ptr(-25.6), false, false},
		{"zero expected exact", 0.0, 1.0, ptr(0.0), true, false},
		{"zero expected tiny drift", 0.0, 1.0, ptr(0.00005), true, false},
		{"zero expected wrong", 0.0, 1.0, ptr(0.01), false, false},
		{"missing answer", 10.0, 1.0, nil, false, true},
		{"NaN rejected", 10.0, 1.0, ptr(math.NaN()), false, true},
		{"Inf rejected", 10.0, 1.0, ptr(math.Inf(1)), false, true},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := CheckNumeric(tc.expected, tc.tolPct, tc.submitted)
			if tc.wantErr {
				if err == nil {
					t.Fatalf("expected error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got != tc.wantOK {
				t.Fatalf("CheckNumeric(%v, %v%%, %v) = %v, want %v", tc.expected, tc.tolPct, *tc.submitted, got, tc.wantOK)
			}
		})
	}
}
