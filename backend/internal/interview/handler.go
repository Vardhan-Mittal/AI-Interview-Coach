package interview

import (
	"fmt"
	"log/slog"
	"net/http"

	"github.com/ai-interview-coach/backend/internal/models"
	"github.com/gin-gonic/gin"
)

// Handler holds the HTTP handlers for interview endpoints.
type Handler struct {
	service *Service
	logger  *slog.Logger
}

// NewHandler creates a new interview handler.
func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
		logger:  slog.Default().With("component", "interview-handler"),
	}
}

// Start creates a new interview session with personalized questions.
// POST /api/interview/start
func (h *Handler) Start(c *gin.Context) {
	var req models.InterviewStartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body. Please provide resume and analysis data.",
		})
		return
	}

	if req.Resume.Name == "" && len(req.Resume.Skills) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Resume data is required to start an interview.",
		})
		return
	}

	h.logger.Info("Starting interview", "name", req.Resume.Name)

	resp, err := h.service.StartInterview(c.Request.Context(), req.Resume, req.Analysis)
	if err != nil {
		h.logger.Error("Failed to start interview", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to generate interview questions: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, resp)
}

// SubmitAnswer evaluates a user's answer and returns the next question.
// POST /api/interview/answer
func (h *Handler) SubmitAnswer(c *gin.Context) {
	var req models.AnswerSubmitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body.",
		})
		return
	}

	if req.SessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Session ID is required.",
		})
		return
	}

	if req.Answer == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Answer cannot be empty.",
		})
		return
	}

	h.logger.Info("Answer submitted", "sessionID", req.SessionID, "questionID", req.QuestionID)

	resp, err := h.service.SubmitAnswer(c.Request.Context(), req)
	if err != nil {
		h.logger.Error("Failed to evaluate answer", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to evaluate answer: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, resp)
}

// GetStatus returns the current state of an interview session.
// GET /api/interview/:id/status
func (h *Handler) GetStatus(c *gin.Context) {
	sessionID := c.Param("id")
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Session ID is required.",
		})
		return
	}

	status, err := h.service.GetStatus(sessionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Interview session not found.",
		})
		return
	}

	c.JSON(http.StatusOK, status)
}
