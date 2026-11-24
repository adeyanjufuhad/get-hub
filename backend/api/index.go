package handler

import (
	"net/http"

	"github.com/adeyanjufuhad/get-hub/backend/pkg/vercelapp"
)

// Handler is the Vercel Go Serverless Function entrypoint for all API routes.
func Handler(w http.ResponseWriter, r *http.Request) {
	vercelapp.Handler(w, r)
}
