package report

import (
	"fmt"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Handler holds the HTTP handlers for report endpoints.
type Handler struct {
	service *Service
	logger  *slog.Logger
}

// NewHandler creates a new report handler.
func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
		logger:  slog.Default().With("component", "report-handler"),
	}
}

// GetReport generates and returns the full interview report.
// GET /api/report/:sessionId
func (h *Handler) GetReport(c *gin.Context) {
	sessionID := c.Param("sessionId")
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Session ID is required.",
		})
		return
	}

	h.logger.Info("Generating report", "sessionID", sessionID)

	report, err := h.service.GenerateReport(c.Request.Context(), sessionID)
	if err != nil {
		h.logger.Error("Failed to generate report", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to generate interview report: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, report)
}
