package access

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"

	"github.com/adeyanjufuhad/get-hub/backend/internal/auth"
)

// User carries the minimal user attributes required for authorization & gating decisions.
type User struct {
	ID                    uuid.UUID
	Role                  string
	HasActiveSubscription bool // Populated from subscriptions table in Phase 3
}

// Item represents a gatable resource (topic or question).
type Item struct {
	ID     uuid.UUID
	Kind   string // "topic" | "question"
	IsFree bool
}

// Policy controls whether paid gating is currently enforced.
// Phase 1 runs with EnforcePaid=false so all study content is open;
// Phase 3 simply switches ENFORCE_PAID_GATING=true.
type Policy struct {
	EnforcePaid bool
}

// CanAccess is the single source of truth for free-vs-paid access rules.
func CanAccess(user User, item Item, policy Policy) bool {
	if user.Role == "admin" {
		return true
	}
	if !policy.EnforcePaid {
		return true
	}
	if item.IsFree {
		return true
	}
	return user.HasActiveSubscription
}

// CanAccessOwnerResource guarantees users can only read/write their own attempts, progress, and mock exams.
func CanAccessOwnerResource(caller auth.Identity, resourceOwnerID uuid.UUID) bool {
	if caller.Role == "admin" {
		return true
	}
	return caller.UserID != uuid.Nil && caller.UserID == resourceOwnerID
}

// ItemLoader fetches the gatable Item for a request before the handler runs.
type ItemLoader func(r *http.Request) (Item, error)

// RequireItemAccess wraps a handler with CanAccess enforcement.
func RequireItemAccess(policy Policy, loader ItemLoader) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			id, ok := auth.FromContext(r.Context())
			if !ok {
				writeAccessError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication required.")
				return
			}

			item, err := loader(r)
			if err != nil {
				writeAccessError(w, http.StatusNotFound, "NOT_FOUND", "Requested study item was not found.")
				return
			}

			user := User{
				ID:                    id.UserID,
				Role:                  id.Role,
				HasActiveSubscription: false, // Phase 3: hydrate from subscriptions table
			}
			if !CanAccess(user, item, policy) {
				writeAccessError(w, http.StatusPaymentRequired, "SUBSCRIPTION_REQUIRED", "Upgrade to GET Hub Pro to unlock this study item.")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func writeAccessError(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"error": map[string]any{
			"code":    code,
			"message": message,
		},
	})
}
