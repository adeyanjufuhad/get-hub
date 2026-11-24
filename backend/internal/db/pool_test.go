package db

import (
	"context"
	"os"
	"testing"

	"github.com/google/uuid"
)

// Requires a live database; runs only when TEST_DATABASE_URL is set.
func TestUUIDSliceRoundTripSimpleProtocol(t *testing.T) {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("TEST_DATABASE_URL not set")
	}
	pool, err := NewPool(context.Background(), dsn)
	if err != nil {
		t.Fatal(err)
	}
	defer pool.Close()

	in := []uuid.UUID{uuid.New(), uuid.New()}
	var out []uuid.UUID
	if err := pool.QueryRow(context.Background(), `SELECT $1::uuid[]`, in).Scan(&out); err != nil {
		t.Fatalf("uuid[] round trip: %v", err)
	}
	if len(out) != 2 || out[0] != in[0] || out[1] != in[1] {
		t.Fatalf("got %v, want %v", out, in)
	}

	var n int
	if err := pool.QueryRow(context.Background(), `SELECT COUNT(*) FROM unnest($1::uuid[]) u WHERE u = ANY($2::uuid[])`, in, in[:1]).Scan(&n); err != nil {
		t.Fatalf("ANY($1::uuid[]): %v", err)
	}
	if n != 1 {
		t.Fatalf("ANY match count = %d, want 1", n)
	}
}
