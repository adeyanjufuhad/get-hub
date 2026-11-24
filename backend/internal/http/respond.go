package httpapi

import (
	"encoding/json"
	"net/http"
)

// ErrorDetail is the consistent JSON error format across all API endpoints.
type ErrorDetail struct {
	Code    string            `json:"code"`
	Message string            `json:"message"`
	Fields  map[string]string `json:"fields,omitempty"`
}

type ErrorEnvelope struct {
	Error ErrorDetail `json:"error"`
}

func WriteJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func WriteError(w http.ResponseWriter, status int, code, message string) {
	WriteJSON(w, status, ErrorEnvelope{
		Error: ErrorDetail{
			Code:    code,
			Message: message,
		},
	})
}

func WriteValidationError(w http.ResponseWriter, message string, fields map[string]string) {
	WriteJSON(w, http.StatusBadRequest, ErrorEnvelope{
		Error: ErrorDetail{
			Code:    "VALIDATION_ERROR",
			Message: message,
			Fields:  fields,
		},
	})
}
