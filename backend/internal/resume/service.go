package resume

import (
	"context"

	"github.com/ai-interview-coach/backend/internal/ai"
	"github.com/ai-interview-coach/backend/internal/models"
)

// Service handles resume-related business logic.
type Service struct {
	aiClient *ai.Client
}

// NewService creates a new resume service.
func NewService(aiClient *ai.Client) *Service {
	return &Service{aiClient: aiClient}
}

// ParseFromText sends raw resume text to AI for structured parsing.
func (s *Service) ParseFromText(ctx context.Context, rawText string) (*models.ParsedResume, error) {
	return s.aiClient.ParseResume(ctx, rawText)
}

// Analyze evaluates a parsed resume for strengths, weaknesses, and ATS compatibility.
func (s *Service) Analyze(ctx context.Context, resume *models.ParsedResume) (*models.ResumeAnalysis, error) {
	return s.aiClient.AnalyzeResume(ctx, resume)
}
