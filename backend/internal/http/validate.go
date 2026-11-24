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

// ValidDepartments lists OAU Faculty of Technology engineering departments.
var ValidDepartments = map[string]bool{
	"Computer Science and Engineering":           true,
	"Electronic and Electrical Engineering":      true,
	"Mechanical Engineering":                     true,
	"Civil Engineering":                          true,
	"Chemical Engineering":                       true,
	"Agricultural and Environmental Engineering": true,
	"Materials Science and Engineering":          true,
	"Food Science and Technology":                true,
}

var ValidLevels = map[string]bool{
	"100L": true,
	"200L": true,
	"300L": true,
	"400L": true,
	"500L": true,
}
