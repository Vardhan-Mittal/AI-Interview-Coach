package chatbot

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Handler handles HTTP requests for the chatbot API.
type Handler struct {
	service *Service
	logger  *slog.Logger
}

// NewHandler creates a new chatbot handler.
func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
		logger:  slog.Default().With("component", "chatbot-handler"),
	}
}

// Init handles POST /api/chat/init — initializes a RAG session for a resume.
func (h *Handler) Init(c *gin.Context) {
	var req ChatInitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	// Generate session ID if not provided
	sessionID := req.SessionID
	if sessionID == "" {
		sessionID = "chat-" + uuid.New().String()
	}

	chunkCount, err := h.service.InitSession(c.Request.Context(), sessionID, &req.Resume)
	if err != nil {
		h.logger.Error("Failed to initialize chat session", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize chat session: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, ChatInitResponse{
		SessionID:  sessionID,
		Message:    "Chat session initialized! Ask me anything about your resume.",
		ChunkCount: chunkCount,
	})
}

// Message handles POST /api/chat/message — processes a user message and returns AI response.
func (h *Handler) Message(c *gin.Context) {
	var req ChatMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	if req.SessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "session_id is required"})
		return
	}

	if req.Message == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "message is required"})
		return
	}

	if !h.service.HasSession(req.SessionID) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chat session not found. Please initialize a session first."})
		return
	}

	resp, err := h.service.Chat(c.Request.Context(), req.SessionID, req.Message, req.History)
	if err != nil {
		h.logger.Error("Chat message failed", "sessionID", req.SessionID, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process message: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}
