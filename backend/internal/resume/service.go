package resume

import (
	"context"

	"github.com/ai-interview-coach/backend/internal/ai"
	"github.com/ai-interview-coach/backend/internal/models"
	"gorm.io/gorm"
)

// Service handles resume-related business logic.
type Service struct {
	aiClient *ai.Client
	db       *gorm.DB
}

// NewService creates a new resume service.
func NewService(aiClient *ai.Client, db *gorm.DB) *Service {
	return &Service{aiClient: aiClient, db: db}
}

// ParseFromText sends raw resume text to AI for structured parsing.
func (s *Service) ParseFromText(ctx context.Context, rawText string) (*models.ParsedResume, error) {
	parsed, err := s.aiClient.ParseResume(ctx, rawText)
	if err != nil {
		return nil, err
	}
	parsed.RawText = rawText
	return parsed, nil
}

// Analyze evaluates a parsed resume for strengths, weaknesses, and ATS compatibility.
func (s *Service) Analyze(ctx context.Context, resume *models.ParsedResume) (*models.ResumeAnalysis, error) {
	analysis, err := s.aiClient.AnalyzeResume(ctx, resume)
	if err != nil {
		return nil, err
	}

	if s.db != nil {
		entity := models.ResumeEntity{
			Name:     resume.Name,
			RawText:  resume.RawText,
			Parsed:   *resume,
			Analysis: analysis,
			ATSScore: analysis.ATSScore,
		}
		s.db.Save(&entity)
	}

	return analysis, nil
}

// Roast generates a humorous roast and serious critique of the resume.
func (s *Service) Roast(ctx context.Context, resume *models.ParsedResume, persona string) (*models.RoastResponse, error) {
	if persona == "" {
		persona = "gordon" // default persona
	}
	return s.aiClient.RoastResume(ctx, resume, persona)
}
