package report

import (
	"context"

	"github.com/ai-interview-coach/backend/internal/ai"
	"github.com/ai-interview-coach/backend/internal/interview"
	"github.com/ai-interview-coach/backend/internal/models"
)

// Service handles report generation and scoring.
type Service struct {
	aiClient         *ai.Client
	interviewService *interview.Service
}

// NewService creates a new report service.
func NewService(aiClient *ai.Client, interviewService *interview.Service) *Service {
	return &Service{
		aiClient:         aiClient,
		interviewService: interviewService,
	}
}

// GenerateReport creates a comprehensive interview report for a completed session.
func (s *Service) GenerateReport(ctx context.Context, sessionID string) (*models.InterviewReport, error) {
	session, err := s.interviewService.GetSession(sessionID)
	if err != nil {
		return nil, err
	}

	return s.aiClient.GenerateReport(ctx, session)
}
