package job

import (
	"context"

	"github.com/ai-interview-coach/backend/internal/ai"
	"github.com/ai-interview-coach/backend/internal/models"
)

// Service handles job matching business logic.
type Service struct {
	aiClient *ai.Client
}

// NewService creates a new job matching service.
func NewService(aiClient *ai.Client) *Service {
	return &Service{aiClient: aiClient}
}

// Match analyzes compatibility between a candidate's resume and a target job description.
func (s *Service) Match(ctx context.Context, req *models.JobMatchRequest) (*models.JobMatchResponse, error) {
	return s.aiClient.MatchJob(ctx, req)
}
