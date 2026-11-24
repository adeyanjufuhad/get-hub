package access

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"

	"github.com/adeyanjufuhad/get-hub/backend/internal/auth"
)

func TestCanAccessPolicy(t *testing.T) {
	student := User{ID: uuid.New(), Role: "student", HasActiveSubscription: false}
	proStudent := User{ID: uuid.New(), Role: "student", HasActiveSubscription: true}
	admin := User{ID: uuid.New(), Role: "admin", HasActiveSubscription: false}

	freeItem := Item{ID: uuid.New(), Kind: "topic", IsFree: true}
	paidItem := Item{ID: uuid.New(), Kind: "topic", IsFree: false}

	// Phase 1 (EnforcePaid = false): everyone accesses everything
	phase1 := Policy{EnforcePaid: false}
	if !CanAccess(student, paidItem, phase1) {
		t.Fatalf("Phase 1 should allow student access to paid items")
	}

	// Phase 3 (EnforcePaid = true): free items open, paid items require subscription or admin
	phase3 := Policy{EnforcePaid: true}
	if !CanAccess(student, freeItem, phase3) {
		t.Fatalf("Phase 3 should allow student access to free items")
	}
	if CanAccess(student, paidItem, phase3) {
		t.Fatalf("Phase 3 must block unsubscribed student from paid items")
	}
	if !CanAccess(proStudent, paidItem, phase3) {
		t.Fatalf("Phase 3 should allow subscribed student access to paid items")
	}
	if !CanAccess(admin, paidItem, phase3) {
		t.Fatalf("Admin should always have access")
	}
}

func TestCanAccessOwnerResource(t *testing.T) {
	ownerID := uuid.New()
	otherID := uuid.New()

	owner := auth.Identity{UserID: ownerID, Role: "student"}
	other := auth.Identity{UserID: otherID, Role: "student"}
	admin := auth.Identity{UserID: uuid.New(), Role: "admin"}

	if !CanAccessOwnerResource(owner, ownerID) {
		t.Fatalf("owner must be allowed to access own resource")
	}
	if CanAccessOwnerResource(other, ownerID) {
		t.Fatalf("another student must NOT access owner's resource")
	}
	if !CanAccessOwnerResource(admin, ownerID) {
		t.Fatalf("admin should be allowed")
	}
}

func TestRequireItemAccessMiddleware(t *testing.T) {
	paidLoader := func(r *http.Request) (Item, error) {
		return Item{ID: uuid.New(), Kind: "question", IsFree: false}, nil
	}

	handler := RequireItemAccess(Policy{EnforcePaid: true}, paidLoader)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// Unsubscribed student -> 402 Payment Required when EnforcePaid=true
	req := httptest.NewRequest(http.MethodGet, "/api/v1/topics/123/questions", nil)
	req = req.WithContext(auth.WithIdentity(req.Context(), auth.Identity{UserID: uuid.New(), Role: "student"}))
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusPaymentRequired {
		t.Fatalf("expected 402 for unsubscribed student on paid item, got %d", rec.Code)
	}

	// Admin -> 200
	req = httptest.NewRequest(http.MethodGet, "/api/v1/topics/123/questions", nil)
	req = req.WithContext(auth.WithIdentity(req.Context(), auth.Identity{UserID: uuid.New(), Role: "admin"}))
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 for admin on paid item, got %d", rec.Code)
	}
}
