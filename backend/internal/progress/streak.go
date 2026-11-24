package progress

import "time"

// ComputeStreak calculates consecutive daily study days (in Africa/Lagos calendar dates)
// given a slice of distinct study dates sorted descending (newest first).
// A streak remains active if the student studied today OR yesterday.
func ComputeStreak(daysDesc []time.Time, now time.Time) int {
	if len(daysDesc) == 0 {
		return 0
	}

	loc, err := time.LoadLocation("Africa/Lagos")
	if err != nil {
		loc = time.FixedZone("WAT", 3600)
	}

	today := truncateDate(now.In(loc))
	first := truncateDate(daysDesc[0])

	diffDays := int(today.Sub(first).Hours() / 24)
	if diffDays > 1 {
		return 0
	}

	streak := 1
	prev := first
	for i := 1; i < len(daysDesc); i++ {
		cur := truncateDate(daysDesc[i])
		gap := int(prev.Sub(cur).Hours() / 24)
		if gap == 0 {
			continue
		}
		if gap == 1 {
			streak++
			prev = cur
		} else {
			break
		}
	}
	return streak
}

func truncateDate(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC)
}
