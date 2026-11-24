package config

import (
	"bufio"
	"errors"
	"os"
	"strings"
)

// LoadDefaultDotEnv loads environment variables from .env (when running inside backend/)
// or backend/.env (when running from the repository root) if present.
// Existing OS environment variables are never overwritten.
func LoadDefaultDotEnv() error {
	for _, path := range []string{".env", "backend/.env"} {
		info, err := os.Stat(path)
		if err != nil {
			if errors.Is(err, os.ErrNotExist) {
				continue
			}
			return err
		}
		if info.IsDir() {
			continue
		}
		return LoadDotEnv(path)
	}
	return nil
}

// LoadDotEnv reads a .env file and sets any key not already present in the OS environment.
func LoadDotEnv(path string) error {
	f, err := os.Open(path)
	if err != nil {
		return err
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		key, val, ok := parseDotEnvLine(scanner.Text())
		if !ok {
			continue
		}
		if _, exists := os.LookupEnv(key); !exists {
			if err := os.Setenv(key, val); err != nil {
				return err
			}
		}
	}
	return scanner.Err()
}

func parseDotEnvLine(raw string) (key, val string, ok bool) {
	line := strings.TrimSpace(raw)
	if line == "" || strings.HasPrefix(line, "#") {
		return "", "", false
	}

	if strings.HasPrefix(line, "export ") {
		line = strings.TrimSpace(strings.TrimPrefix(line, "export "))
	}

	idx := strings.IndexByte(line, '=')
	if idx <= 0 {
		return "", "", false
	}

	key = strings.TrimSpace(line[:idx])
	if key == "" || strings.ContainsAny(key, " \t") {
		return "", "", false
	}

	rawVal := strings.TrimSpace(line[idx+1:])
	val = parseDotEnvValue(rawVal)
	return key, val, true
}

func parseDotEnvValue(raw string) string {
	if raw == "" {
		return ""
	}

	if raw[0] == '"' || raw[0] == '\'' {
		quote := raw[0]
		escaped := false
		var b strings.Builder
		for i := 1; i < len(raw); i++ {
			ch := raw[i]
			if quote == '"' && !escaped && ch == '\\' {
				escaped = true
				continue
			}
			if !escaped && ch == quote {
				return b.String()
			}
			if quote == '"' && escaped {
				switch ch {
				case 'n':
					b.WriteByte('\n')
				case 'r':
					b.WriteByte('\r')
				case 't':
					b.WriteByte('\t')
				default:
					b.WriteByte(ch)
				}
				escaped = false
				continue
			}
			b.WriteByte(ch)
		}
		// Unclosed quote: fall back to trimmed content without leading quote.
		return strings.TrimSpace(raw[1:])
	}

	// Unquoted value: strip trailing inline comment preceded by whitespace.
	for i := 0; i < len(raw); i++ {
		if raw[i] == '#' && i > 0 && (raw[i-1] == ' ' || raw[i-1] == '\t') {
			return strings.TrimSpace(raw[:i])
		}
	}
	return strings.TrimSpace(raw)
}
