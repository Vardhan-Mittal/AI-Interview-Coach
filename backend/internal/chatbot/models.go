package chatbot

import "github.com/ai-interview-coach/backend/internal/models"

// ChatInitRequest is the request body to initialize a chat session with resume context.
type ChatInitRequest struct {
	SessionID string              `json:"session_id"`
	Resume    models.ParsedResume `json:"resume"`
}

// ChatInitResponse is returned after successfully initializing a chat session.
type ChatInitResponse struct {
	SessionID string `json:"session_id"`
	Message   string `json:"message"`
	ChunkCount int   `json:"chunk_count"`
}

// ChatMessage represents a single message in the conversation history.
type ChatMessage struct {
	Role    string `json:"role"`    // "user" or "assistant"
	Content string `json:"content"`
}

// ChatMessageRequest is the request body to send a message in an existing chat session.
type ChatMessageRequest struct {
	SessionID string        `json:"session_id"`
	Message   string        `json:"message"`
	History   []ChatMessage `json:"history,omitempty"`
}

// ChatSource represents a chunk of resume context that was used to generate the response.
type ChatSource struct {
	Section string `json:"section"` // e.g. "project", "experience", "skills"
	Title   string `json:"title"`   // e.g. project name, company name
	Text    string `json:"text"`    // the actual chunk text
	Score   float64 `json:"score"`  // similarity score 0-1
}

// ChatMessageResponse is returned after processing a chat message.
type ChatMessageResponse struct {
	Reply   string       `json:"reply"`
	Sources []ChatSource `json:"sources,omitempty"`
}
