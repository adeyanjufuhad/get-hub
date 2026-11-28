package httpapi

import "testing"

func TestValidDepartments(t *testing.T) {
	if !ValidDepartments["Computer Engineering"] {
		t.Fatal(`expected "Computer Engineering" to be a valid department`)
	}
	if ValidDepartments["Computer Science and Engineering"] {
		t.Fatal(`expected legacy "Computer Science and Engineering" to be rejected`)
	}

	total := 0
	for faculty, depts := range FacultyDepartments {
		for _, dept := range depts {
			total++
			if !ValidDepartments[dept] {
				t.Errorf("department %q in %q missing from ValidDepartments", dept, faculty)
			}
		}
	}
	if len(ValidDepartments) != total {
		t.Errorf("ValidDepartments has %d entries, want %d", len(ValidDepartments), total)
	}
}
