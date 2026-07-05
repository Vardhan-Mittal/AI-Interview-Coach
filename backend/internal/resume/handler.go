package resume

import (
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/ai-interview-coach/backend/internal/models"
	"github.com/gin-gonic/gin"
)

// Handler holds the HTTP handlers for resume endpoints.
type Handler struct {
	service *Service
	logger  *slog.Logger
}

// NewHandler creates a new resume handler.
func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
		logger:  slog.Default().With("component", "resume-handler"),
	}
}

// Upload handles PDF file upload, text extraction, and AI-powered resume parsing.
// POST /api/resume/upload
func (h *Handler) Upload(c *gin.Context) {
	// Get the uploaded file
	file, header, err := c.Request.FormFile("resume")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "No file uploaded. Please upload a PDF resume.",
		})
		return
	}
	defer file.Close()

	// Validate file type
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Unsupported file type: %s. Only PDF files are supported.", ext),
		})
		return
	}

	// Validate file size (max 10MB)
	if header.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "File too large. Maximum size is 10MB.",
		})
		return
	}

	h.logger.Info("Resume uploaded", "filename", header.Filename, "size", header.Size)

	// Read file into memory for PDF processing
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read uploaded file.",
		})
		return
	}

	// Extract text from PDF
	rawText, err := ExtractTextFromPDF(fileBytes)
	if err != nil {
		h.logger.Error("PDF text extraction failed", "error", err)
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"error": fmt.Sprintf("Failed to extract text from PDF: %v", err),
		})
		return
	}

	h.logger.Info("PDF text extracted", "textLength", len(rawText))

	// Parse resume using AI
	resume, err := h.service.ParseFromText(c.Request.Context(), rawText)
	if err != nil {
		h.logger.Error("AI resume parsing failed", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to parse resume with AI: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, models.ResumeUploadResponse{
		Resume:  *resume,
		RawText: rawText,
	})
}

// Analyze evaluates a parsed resume for strengths, weaknesses, and ATS compatibility.
// POST /api/resume/analyze
func (h *Handler) Analyze(c *gin.Context) {
	var req models.ResumeAnalyzeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body. Please provide a parsed resume.",
		})
		return
	}

	// Validate that we have some data to analyze
	if req.Resume.Name == "" && len(req.Resume.Skills) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Resume data is empty. Please upload and parse a resume first.",
		})
		return
	}

	h.logger.Info("Analyzing resume", "name", req.Resume.Name)

	analysis, err := h.service.Analyze(c.Request.Context(), &req.Resume)
	if err != nil {
		h.logger.Error("Resume analysis failed", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to analyze resume: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, models.ResumeAnalyzeResponse{
		Analysis: *analysis,
	})
}

// Roast evaluates a parsed resume with a humorous roast and redemption plan.
// POST /api/resume/roast
func (h *Handler) Roast(c *gin.Context) {
	var req models.RoastRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body. Please provide a parsed resume.",
		})
		return
	}

	if req.Resume.Name == "" && len(req.Resume.Skills) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Resume data is empty. Please upload and parse a resume first.",
		})
		return
	}

	h.logger.Info("Roasting resume", "name", req.Resume.Name, "persona", req.Persona)

	roast, err := h.service.Roast(c.Request.Context(), &req.Resume, req.Persona)
	if err != nil {
		h.logger.Error("Resume roast failed", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to roast resume: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, roast)
}
