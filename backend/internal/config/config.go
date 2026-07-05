package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config holds all application configuration.
type Config struct {
	Port        string
	CORSOrigin  string
	OpenAIKey   string
	OpenAIModel string
	DatabaseURL string
}

// Load reads configuration from environment variables.
// It attempts to load a .env file first, but will not fail if it doesn't exist.
func Load() *Config {
	// Load .env file if it exists (won't error if missing)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	cfg := &Config{
		Port:        getEnv("PORT", "8080"),
		CORSOrigin:  getEnv("CORS_ORIGIN", "http://localhost:3000"),
		OpenAIKey:   getEnv("OPENAI_API_KEY", ""),
		OpenAIModel: getEnv("OPENAI_MODEL", "gpt-4o-mini"),
		DatabaseURL: getEnv("DATABASE_URL", "file:interview_coach.db"),
	}

	if cfg.OpenAIKey == "" {
		log.Println("WARNING: OPENAI_API_KEY is not set. AI features will not work.")
	}

	return cfg
}

// getEnv returns the value of an environment variable, or a default value if not set.
func getEnv(key, defaultVal string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return defaultVal
}
