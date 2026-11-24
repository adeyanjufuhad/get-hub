package progress

import (
	"testing"
	"time"
)

func TestComputeStreak(t *testing.T) {
	now := time.Date(2026, 11, 24, 15, 0, 0, 0, time.UTC)

	day := func(d int) time.Time {
		return time.Date(2026, 11, d, 0, 0, 0, 0, time.UTC)
	}

	if got := ComputeStreak(nil, now); got != 0 {
		t.Fatalf("empty days expected 0, got %d", got)
	}
	if got := ComputeStreak([]time.Time{day(24), day(23), day(22)}, now); got != 3 {
		t.Fatalf("expected 3-day streak including today, got %d", got)
	}
	if got := ComputeStreak([]time.Time{day(23), day(22)}, now); got != 2 {
		t.Fatalf("expected 2-day streak ending yesterday, got %d", got)
	}
	if got := ComputeStreak([]time.Time{day(21), day(20)}, now); got != 0 {
		t.Fatalf("expected broken streak = 0, got %d", got)
	}
	if got := ComputeStreak([]time.Time{day(24), day(23), day(20)}, now); got != 2 {
		t.Fatalf("expected streak to stop at gap = 2, got %d", got)
	}
}
