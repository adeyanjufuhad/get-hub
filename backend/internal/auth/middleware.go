package auth

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
)

type contextKey string

const userContextKey contextKey = "auth_user"

// Identity represents the authenticated user extracted from the JWT cookie.
type Identity struct {
	UserID uuid.UUID
	Email  string
	Role   string
}

func WithIdentity(ctx context.Context, id Identity) context.Context {
	return context.WithValue(ctx, userContextKey, id)
}

func FromContext(ctx context.Context) (Identity, bool) {
	id, ok := ctx.Value(userContextKey).(Identity)
	return id, ok
}

// OptionalAuth extracts and validates the access cookie if present without failing unauthenticated requests.
func OptionalAuth(tm *TokenManager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie(AccessCookieName)
			if err == nil && cookie.Value != "" {
				if claims, err := tm.ParseAccessToken(cookie.Value); err == nil {
					ctx := WithIdentity(r.Context(), Identity{
						UserID: claims.UserID,
						Email:  claims.Email,
						Role:   claims.Role,
					})
					r = r.WithContext(ctx)
				}
			}
			next.ServeHTTP(w, r)
		})
	}
}

// RequireAuth blocks requests without a valid JWT access cookie.
func RequireAuth(tm *TokenManager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie(AccessCookieName)
			if err != nil || cookie.Value == "" {
				writeAuthError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication required.")
				return
			}
			claims, err := tm.ParseAccessToken(cookie.Value)
			if err != nil {
				writeAuthError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Session expired or invalid. Please sign in again.")
				return
			}
			ctx := WithIdentity(r.Context(), Identity{
				UserID: claims.UserID,
				Email:  claims.Email,
				Role:   claims.Role,
			})
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireAdmin ensures the authenticated caller has role == "admin".
func RequireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id, ok := FromContext(r.Context())
		if !ok {
			writeAuthError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication required.")
			return
		}
		if id.Role != "admin" {
			writeAuthError(w, http.StatusForbidden, "FORBIDDEN", "Admin privileges are required for this action.")
			return
		}
		next.ServeHTTP(w, r)
	})
}

func writeAuthError(w http.ResponseWriter, status int, code, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"error": map[string]any{
			"code":    code,
			"message": msg,
		},
	})
}
