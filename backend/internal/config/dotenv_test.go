package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadDotEnvParsesAndRespectsExistingEnv(t *testing.T) {
	dir := t.TempDir()
	envPath := filepath.Join(dir, ".env")
	content := "# comment\r\n" +
		"PORT=9090 # inline comment\r\n" +
		"export APP_ENV=staging\r\n" +
		"JWT_SECRET=\"quoted value # not a comment\"\r\n" +
		"SINGLE_Q='hello # world'\r\n" +
		"EMPTY_VAL=\r\n" +
		"URL_WITH_HASH=postgres://user:pass#123@host/db?sslmode=require\r\n" +
		"EXISTING_KEY=from-dotenv\r\n"
	if err := os.WriteFile(envPath, []byte(content), 0o600); err != nil {
		t.Fatalf("write temp .env: %v", err)
	}

	keys := []string{
		"PORT",
		"APP_ENV",
		"JWT_SECRET",
		"SINGLE_Q",
		"EMPTY_VAL",
		"URL_WITH_HASH",
		"EXISTING_KEY",
	}
	for _, k := range keys {
		t.Setenv(k, "")
		_ = os.Unsetenv(k)
	}
	t.Setenv("EXISTING_KEY", "from-os")

	if err := LoadDotEnv(envPath); err != nil {
		t.Fatalf("LoadDotEnv failed: %v", err)
	}

	cases := map[string]string{
		"PORT":          "9090",
		"APP_ENV":       "staging",
		"JWT_SECRET":    "quoted value # not a comment",
		"SINGLE_Q":      "hello # world",
		"EMPTY_VAL":     "",
		"URL_WITH_HASH": "postgres://user:pass#123@host/db?sslmode=require",
		"EXISTING_KEY":  "from-os",
	}
	for k, want := range cases {
		got, ok := os.LookupEnv(k)
		if !ok {
			t.Fatalf("expected env var %s to be set", k)
		}
		if got != want {
			t.Fatalf("env %s = %q, want %q", k, got, want)
		}
	}
}

func TestLoadDefaultDotEnvNoFileIsNoOp(t *testing.T) {
	origWD, err := os.Getwd()
	if err != nil {
		t.Fatalf("getwd: %v", err)
	}
	tmp := t.TempDir()
	if err := os.Chdir(tmp); err != nil {
		t.Fatalf("chdir: %v", err)
	}
	t.Cleanup(func() { _ = os.Chdir(origWD) })

	if err := LoadDefaultDotEnv(); err != nil {
		t.Fatalf("expected nil when no .env exists, got %v", err)
	}
}
