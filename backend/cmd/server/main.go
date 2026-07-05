package main

import (
	"fmt"
	"log"
	"log/slog"
	"os"

	"github.com/ai-interview-coach/backend/internal/ai"
	"github.com/ai-interview-coach/backend/internal/config"
	"github.com/ai-interview-coach/backend/internal/interview"
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
	aiClient := ai.NewClient(cfg.OpenAIKey, cfg.OpenAIModel)
	slog.Info("AI client initialized", "model", cfg.OpenAIModel)

	// Initialize services
	resumeService := resume.NewService(aiClient)
	interviewService := interview.NewService(aiClient)
	reportService := report.NewService(aiClient, interviewService)

	// Initialize handlers
	resumeHandler := resume.NewHandler(resumeService)
	interviewHandler := interview.NewHandler(interviewService)
	reportHandler := report.NewHandler(reportService)

	// Setup router
	router := routes.SetupRouter(
		cfg.CORSOrigin,
		resumeHandler,
		interviewHandler,
		reportHandler,
	)

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Port)
	slog.Info("Server starting", "address", addr, "cors_origin", cfg.CORSOrigin)

	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
