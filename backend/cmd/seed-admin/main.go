package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/adeyanjufuhad/get-hub/backend/internal/auth"
	"github.com/adeyanjufuhad/get-hub/backend/internal/config"
	"github.com/adeyanjufuhad/get-hub/backend/internal/db"
	"github.com/adeyanjufuhad/get-hub/backend/internal/db/sqlc"
)

// Small CLI to either promote an existing account to admin or create a new admin user.
// Usage:
//   DATABASE_URL=... go run ./cmd/seed-admin -email you@oauife.edu.ng
//   DATABASE_URL=... go run ./cmd/seed-admin -email you@oauife.edu.ng -name "Fuhad Adeyanju" -password "your-strong-pass"
func main() {
	if err := config.LoadDefaultDotEnv(); err != nil {
		log.Fatalf("load .env: %v", err)
	}

	emailFlag := flag.String("email", "", "Email address to promote or create as admin")
	nameFlag := flag.String("name", "GET Hub Admin", "Full name (used only if creating a new account)")
	passFlag := flag.String("password", "", "Password (required only if the account does not exist yet)")
	deptFlag := flag.String("department", "Computer Engineering", "OAU engineering department")
	flag.Parse()

	email := strings.TrimSpace(strings.ToLower(*emailFlag))
	if email == "" {
		log.Fatal("error: -email is required")
	}

	dbURL := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	if dbURL == "" {
		log.Fatal("error: DATABASE_URL env var is required")
	}

	ctx := context.Background()
	pool, err := db.NewPool(ctx, dbURL)
	if err != nil {
		log.Fatalf("connect db: %v", err)
	}
	defer pool.Close()

	q := sqlc.New(pool)

	user, err := q.PromoteUserToAdmin(ctx, email)
	if err == nil {
		fmt.Printf("Promoted existing user %s (%s) to admin.\n", user.Email, user.ID)
		return
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		log.Fatalf("promote user: %v", err)
	}

	if len(*passFlag) < 8 {
		log.Fatal("user does not exist yet; provide -password (min 8 chars) to create a new admin account")
	}

	hash, err := auth.HashPassword(*passFlag)
	if err != nil {
		log.Fatalf("hash password: %v", err)
	}

	created, err := q.CreateUser(ctx, sqlc.CreateUserParams{
		Email:        email,
		PasswordHash: pgtype.Text{String: hash, Valid: true},
		FullName:     strings.TrimSpace(*nameFlag),
		Department:   strings.TrimSpace(*deptFlag),
		Level:        "200L",
		Role:         "admin",
		AvatarColor:  "#EA580C",
	})
	if err != nil {
		log.Fatalf("create admin: %v", err)
	}

	fmt.Printf("Created new admin user %s (%s).\n", created.Email, created.ID)
}
