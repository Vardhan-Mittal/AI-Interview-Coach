package interview

import (
	"context"
	"fmt"
	"sync"

	"github.com/ai-interview-coach/backend/internal/ai"
	"github.com/ai-interview-coach/backend/internal/models"
	"github.com/google/uuid"
)

// Service manages interview sessions with adaptive difficulty.
type Service struct {
	aiClient *ai.Client
	sessions map[string]*models.InterviewSession
	mu       sync.RWMutex
}

// NewService creates a new interview service.
func NewService(aiClient *ai.Client) *Service {
	return &Service{
		aiClient: aiClient,
		sessions: make(map[string]*models.InterviewSession),
	}
}

// StartInterview generates personalized questions and creates a new session.
func (s *Service) StartInterview(ctx context.Context, resume models.ParsedResume, analysis models.ResumeAnalysis) (*models.InterviewStartResponse, error) {
	// Generate questions starting at medium difficulty
	questions, err := s.aiClient.GenerateQuestions(ctx, &resume, &analysis, "medium")
	if err != nil {
		return nil, fmt.Errorf("failed to generate questions: %w", err)
	}

	if len(questions) == 0 {
		return nil, fmt.Errorf("AI generated zero questions")
	}

	// Create session
	sessionID := uuid.New().String()
	session := &models.InterviewSession{
		ID:              sessionID,
		Resume:          resume,
		Analysis:        analysis,
		Questions:       questions,
		CurrentIndex:    0,
		DifficultyLevel: "medium",
		Answers:         make([]models.Answer, 0),
	}

	s.mu.Lock()
	s.sessions[sessionID] = session
	s.mu.Unlock()

	return &models.InterviewStartResponse{
		SessionID:      sessionID,
		TotalQuestions: len(questions),
		FirstQuestion:  questions[0],
	}, nil
}

// SubmitAnswer evaluates an answer and returns the next question with adaptive difficulty.
func (s *Service) SubmitAnswer(ctx context.Context, req models.AnswerSubmitRequest) (*models.AnswerSubmitResponse, error) {
	s.mu.Lock()
	session, exists := s.sessions[req.SessionID]
	s.mu.Unlock()

	if !exists {
		return nil, fmt.Errorf("session not found: %s", req.SessionID)
	}

	// Get current question
	if session.CurrentIndex >= len(session.Questions) {
		return nil, fmt.Errorf("interview is already complete")
	}

	currentQuestion := session.Questions[session.CurrentIndex]

	// Evaluate the answer using AI
	evaluation, err := s.aiClient.EvaluateAnswer(ctx, currentQuestion, req.Answer, &session.Resume)
	if err != nil {
		return nil, fmt.Errorf("failed to evaluate answer: %w", err)
	}

	// Store the answer
	s.mu.Lock()
	session.Answers = append(session.Answers, *evaluation)

	// Adaptive difficulty adjustment
	s.adjustDifficulty(session, evaluation.IsCorrect)

	// Move to next question
	session.CurrentIndex++
	s.mu.Unlock()

	// Build response
	response := &models.AnswerSubmitResponse{
		Evaluation:        *evaluation,
		IsComplete:        session.CurrentIndex >= len(session.Questions),
		Progress:          session.CurrentIndex,
		Total:             len(session.Questions),
		CurrentDifficulty: session.DifficultyLevel,
	}

	// Include next question if not complete
	if !response.IsComplete {
		nextQ := session.Questions[session.CurrentIndex]
		response.NextQuestion = &nextQ
	}

	return response, nil
}

// GetSession returns a session by ID.
func (s *Service) GetSession(sessionID string) (*models.InterviewSession, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	session, exists := s.sessions[sessionID]
	if !exists {
		return nil, fmt.Errorf("session not found: %s", sessionID)
	}

	return session, nil
}

// GetStatus returns the current status of an interview session.
func (s *Service) GetStatus(sessionID string) (*models.InterviewStatusResponse, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	session, exists := s.sessions[sessionID]
	if !exists {
		return nil, fmt.Errorf("session not found: %s", sessionID)
	}

	return &models.InterviewStatusResponse{
		SessionID:       session.ID,
		CurrentIndex:    session.CurrentIndex,
		TotalQuestions:  len(session.Questions),
		DifficultyLevel: session.DifficultyLevel,
		IsComplete:      session.CurrentIndex >= len(session.Questions),
		AnsweredCount:   len(session.Answers),
	}, nil
}

// adjustDifficulty implements the adaptive difficulty algorithm.
// Similar to LeetCode: consecutive correct answers increase difficulty,
// consecutive wrong answers decrease it.
func (s *Service) adjustDifficulty(session *models.InterviewSession, isCorrect bool) {
	if isCorrect {
		session.ConsecutiveCorrect++
		session.ConsecutiveWrong = 0
	} else {
		session.ConsecutiveWrong++
		session.ConsecutiveCorrect = 0
	}

	// Increase difficulty after 3 consecutive correct answers
	if session.ConsecutiveCorrect >= 3 {
		switch session.DifficultyLevel {
		case "easy":
			session.DifficultyLevel = "medium"
		case "medium":
			session.DifficultyLevel = "hard"
		}
		session.ConsecutiveCorrect = 0
	}

	// Decrease difficulty after 2 consecutive wrong answers
	if session.ConsecutiveWrong >= 2 {
		switch session.DifficultyLevel {
		case "hard":
			session.DifficultyLevel = "medium"
		case "medium":
			session.DifficultyLevel = "easy"
		}
		session.ConsecutiveWrong = 0
	}
}
