package main

import (
	"fmt"
	"log"
	"log/slog"
	"os"

	"github.com/ai-interview-coach/backend/internal/ai"
	"github.com/ai-interview-coach/backend/internal/config"
	"github.com/ai-interview-coach/backend/internal/db"
	"github.com/ai-interview-coach/backend/internal/interview"
	"github.com/ai-interview-coach/backend/internal/job"
	"github.com/ai-interview-coach/backend/internal/report"
	"github.com/ai-interview-coach/backend/internal/resume"
	"github.com/ai-interview-coach/backend/routes"
)

func main() {
	// Set up structured logging
	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	slog.Info("Starting AI Interview Coach Backend")

	// Load configuration
	cfg := config.Load()

	// Initialize AI client
	aiClient := ai.NewClient(cfg.OpenAIKey, cfg.OpenAIModel, cfg.OpenAIBaseURL)
	slog.Info("AI client initialized", "model", cfg.OpenAIModel, "baseURL", cfg.OpenAIBaseURL)

	// Initialize database (PostgreSQL / SQLite)
	gormDB, err := db.Init(cfg)
	if err != nil {
		slog.Error("Database initialization failed, continuing with in-memory fallback", "error", err)
	}

	// Initialize services
	resumeService := resume.NewService(aiClient, gormDB)
	interviewService := interview.NewService(aiClient, gormDB)
	reportService := report.NewService(aiClient, interviewService, gormDB)
	jobService := job.NewService(aiClient)

	// Initialize handlers
	resumeHandler := resume.NewHandler(resumeService)
	interviewHandler := interview.NewHandler(interviewService)
	reportHandler := report.NewHandler(reportService)
	jobHandler := job.NewHandler(jobService)

	// Setup router
	router := routes.SetupRouter(
		cfg.CORSOrigin,
		resumeHandler,
		interviewHandler,
		reportHandler,
		jobHandler,
	)

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Port)
	slog.Info("Server starting", "address", addr, "cors_origin", cfg.CORSOrigin)

	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
