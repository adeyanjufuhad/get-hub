package httpapi

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/mail"
	"strings"
)

const maxJSONBodyBytes = 1 << 20 // 1 MiB

// DecodeJSON reads a strict JSON body (rejecting unknown fields and oversized payloads).
func DecodeJSON(w http.ResponseWriter, r *http.Request, dst any) error {
	r.Body = http.MaxBytesReader(w, r.Body, maxJSONBodyBytes)
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	if err := dec.Decode(dst); err != nil {
		return err
	}
	if err := dec.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		return errors.New("body must contain a single JSON object")
	}
	return nil
}

// IsValidEmail checks basic RFC 5322 email syntax.
func IsValidEmail(raw string) bool {
	trimmed := strings.TrimSpace(raw)
	if len(trimmed) < 5 || len(trimmed) > 254 {
		return false
	}
	addr, err := mail.ParseAddress(trimmed)
	return err == nil && addr.Address == trimmed
}

// FacultyDepartments lists OAU departments by faculty. Each department belongs to
// exactly one faculty, so the faculty is derived from the department rather than
// stored. Keep in sync with OAU_FACULTIES in frontend/lib/config.ts.
var FacultyDepartments = map[string][]string{
	"Faculty of Technology": {
		"Agricultural and Environmental Engineering",
		"Chemical Engineering",
		"Civil Engineering",
		"Computer Engineering",
		"Electronic and Electrical Engineering",
		"Food Science and Technology",
		"Materials Science and Engineering",
		"Mechanical Engineering",
	},
}

// ValidDepartments is every department in FacultyDepartments.
var ValidDepartments = func() map[string]bool {
	m := make(map[string]bool)
	for _, depts := range FacultyDepartments {
		for _, d := range depts {
			m[d] = true
		}
	}
	return m
}()

var ValidLevels = map[string]bool{
	"100L": true,
	"200L": true,
	"300L": true,
	"400L": true,
	"500L": true,
}
