package report

import (
	"context"

	"github.com/ai-interview-coach/backend/internal/ai"
	"github.com/ai-interview-coach/backend/internal/interview"
	"github.com/ai-interview-coach/backend/internal/models"
	"gorm.io/gorm"
)

// Service handles report generation and scoring.
type Service struct {
	aiClient         *ai.Client
	interviewService *interview.Service
	db               *gorm.DB
}

// NewService creates a new report service.
func NewService(aiClient *ai.Client, interviewService *interview.Service, db *gorm.DB) *Service {
	return &Service{
		aiClient:         aiClient,
		interviewService: interviewService,
		db:               db,
	}
}

// GenerateReport creates a comprehensive interview report for a completed session.
func (s *Service) GenerateReport(ctx context.Context, sessionID string) (*models.InterviewReport, error) {
	if s.db != nil {
		var entity models.ReportEntity
		if err := s.db.Where("session_id = ?", sessionID).First(&entity).Error; err == nil {
			return &models.InterviewReport{
				SessionID:       entity.SessionID,
				OverallScore:    entity.OverallScore,
				Rating:          entity.Rating,
				TopicScores:     entity.TopicScores,
				Heatmap:         entity.Heatmap,
				StudyPlan:       entity.StudyPlan,
				Recommendations: entity.Recommendations,
			}, nil
		}
	}

	session, err := s.interviewService.GetSession(sessionID)
	if err != nil {
		return nil, err
	}

	report, err := s.aiClient.GenerateReport(ctx, session)
	if err != nil {
		return nil, err
	}

	if s.db != nil {
		entity := models.ReportEntity{
			SessionID:       sessionID,
			OverallScore:    report.OverallScore,
			Rating:          report.Rating,
			TopicScores:     report.TopicScores,
			Heatmap:         report.Heatmap,
			StudyPlan:       report.StudyPlan,
			Recommendations: report.Recommendations,
		}
		s.db.Save(&entity)
	}

	return report, nil
}
