package job

import (
	"fmt"
	"log/slog"
	"net/http"

	"github.com/ai-interview-coach/backend/internal/models"
	"github.com/gin-gonic/gin"
)

// Handler holds the HTTP handlers for job matching endpoints.
type Handler struct {
	service *Service
	logger  *slog.Logger
}

// NewHandler creates a new job matching handler.
func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
		logger:  slog.Default().With("component", "job-handler"),
	}
}

// Match evaluates a resume against a job description.
// POST /api/job/match
func (h *Handler) Match(c *gin.Context) {
	var req models.JobMatchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body. Please provide a parsed resume and job description.",
		})
		return
	}

	if req.Resume.Name == "" || req.JobDescription == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Both resume and job description are required.",
		})
		return
	}

	h.logger.Info("Matching job", "candidate", req.Resume.Name, "role", req.TargetRole)

	match, err := h.service.Match(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error("Job match failed", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to analyze job match: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, match)
}
