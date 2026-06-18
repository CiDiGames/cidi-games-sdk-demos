package config

import (
	"bufio"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port               int
	CidiBaseURL        string
	CidiAPIKey         string
	CidiAPISecret      string
	CidiCallbackSecret string
}

func Load() Config {
	loadDotEnv(".env")

	return Config{
		Port:               readIntEnv("PORT", 3002),
		CidiBaseURL:        strings.TrimRight(readEnv("CIDI_BASE_URL", "https://openapi-tst.cidi.games"), "/"),
		CidiAPIKey:         readEnv("CIDI_API_KEY", ""),
		CidiAPISecret:      readEnv("CIDI_API_SECRET", ""),
		CidiCallbackSecret: readEnv("CIDI_CALLBACK_SECRET", ""),
	}
}

func readEnv(name string, fallback string) string {
	value := os.Getenv(name)
	if value == "" {
		return fallback
	}
	return value
}

func readIntEnv(name string, fallback int) int {
	raw := os.Getenv(name)
	if raw == "" {
		return fallback
	}

	value, err := strconv.Atoi(raw)
	if err != nil {
		return fallback
	}
	return value
}

func loadDotEnv(path string) {
	file, err := os.Open(path)
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}

		key = strings.TrimSpace(key)
		value = strings.Trim(strings.TrimSpace(value), `"'`)
		if key != "" && os.Getenv(key) == "" {
			_ = os.Setenv(key, value)
		}
	}
}
