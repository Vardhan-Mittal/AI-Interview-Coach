package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

// Config holds all application configuration.
type Config struct {
	Port          string
	CORSOrigin    string
	OpenAIKey     string
	OpenAIModel   string
	OpenAIBaseURL string
	DatabaseURL   string
}

// Load reads configuration from environment variables.
// It attempts to load a .env file first, but will not fail if it doesn't exist.
func Load() *Config {
	// Load .env file if it exists (won't error if missing)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	apiKey := getEnv("OPENAI_API_KEY", getEnv("GROQ_API_KEY", getEnv("GEMINI_API_KEY", "")))
	model := getEnv("OPENAI_MODEL", getEnv("AI_MODEL", ""))
	baseURL := getEnv("OPENAI_BASE_URL", getEnv("AI_BASE_URL", ""))

	// Default to Google Gemini API
	if baseURL == "" {
		baseURL = "https://generativelanguage.googleapis.com/v1beta/openai/"
	}
	if model == "" || strings.HasPrefix(model, "gpt") || strings.Contains(strings.ToLower(model), "gemini") || strings.Contains(strings.ToLower(model), "llama") {
		model = "gemini-2.5-flash"
	}

	cfg := &Config{
		Port:          getEnv("PORT", "8080"),
		CORSOrigin:    getEnv("CORS_ORIGIN", "http://localhost:3000"),
		OpenAIKey:     apiKey,
		OpenAIModel:   model,
		OpenAIBaseURL: baseURL,
		DatabaseURL:   getEnv("DATABASE_URL", "file:interview_coach.db"),
	}

	if cfg.OpenAIKey == "" {
		log.Println("WARNING: No AI API key found (OPENAI_API_KEY, GROQ_API_KEY, or GEMINI_API_KEY). AI features will not work.")
	} else if cfg.OpenAIBaseURL != "" {
		log.Printf("Using AI provider with Base URL: %s, Model: %s\n", cfg.OpenAIBaseURL, cfg.OpenAIModel)
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
