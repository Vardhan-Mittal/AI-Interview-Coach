package chatbot

import (
	"context"
	"fmt"
	"log/slog"
	"strings"
	"sync"
	"time"

	"github.com/ai-interview-coach/backend/internal/ai"
	"github.com/ai-interview-coach/backend/internal/models"
	openai "github.com/sashabaranov/go-openai"
)

const (
	topK       = 5             // number of relevant chunks to retrieve
	maxHistory = 10            // max conversation messages to include
	sessionTTL = 1 * time.Hour // auto-cleanup after 1 hour idle
)

// session holds the vector store and metadata for a chat session.
type session struct {
	store     *VectorStore
	resume    *models.ParsedResume
	createdAt time.Time
	lastUsed  time.Time
}

// Service orchestrates the RAG pipeline: chunking → embedding → retrieval → generation.
type Service struct {
	aiClient *ai.Client
	mu       sync.RWMutex
	sessions map[string]*session
	logger   *slog.Logger
}

// NewService creates a new chatbot service.
func NewService(aiClient *ai.Client) *Service {
	svc := &Service{
		aiClient: aiClient,
		sessions: make(map[string]*session),
		logger:   slog.Default().With("component", "chatbot"),
	}

	// Start background cleanup goroutine
	go svc.cleanupLoop()

	return svc
}

// InitSession chunks the resume, embeds all chunks, and stores them in a per-session vector store.
func (s *Service) InitSession(ctx context.Context, sessionID string, resume *models.ParsedResume) (int, error) {
	s.logger.Info("Initializing chat session", "sessionID", sessionID, "name", resume.Name)

	// Chunk the resume
	textChunks := ChunkResume(resume)
	if len(textChunks) == 0 {
		return 0, fmt.Errorf("no resume content to process")
	}

	// Extract texts for batch embedding
	texts := make([]string, len(textChunks))
	for i, tc := range textChunks {
		texts[i] = tc.Text
	}

	// Batch embed all chunks
	embeddings, err := s.aiClient.EmbedBatch(ctx, texts)
	if err != nil {
		return 0, fmt.Errorf("failed to embed resume chunks: %w", err)
	}

	// Build vector store
	store := NewVectorStore()
	chunks := make([]Chunk, len(textChunks))
	for i, tc := range textChunks {
		chunks[i] = Chunk{
			ID:        fmt.Sprintf("%s-chunk-%d", sessionID, i),
			Text:      tc.Text,
			Embedding: embeddings[i],
			Metadata: map[string]string{
				"section": tc.Section,
				"title":   tc.Title,
			},
		}
	}
	store.AddBatch(chunks)

	// Store session
	now := time.Now()
	s.mu.Lock()
	s.sessions[sessionID] = &session{
		store:     store,
		resume:    resume,
		createdAt: now,
		lastUsed:  now,
	}
	s.mu.Unlock()

	s.logger.Info("Chat session initialized", "sessionID", sessionID, "chunks", len(chunks))
	return len(chunks), nil
}

// Chat processes a user message: retrieves relevant context, builds a RAG prompt, and generates a response.
func (s *Service) Chat(ctx context.Context, sessionID string, userMessage string, history []ChatMessage) (*ChatMessageResponse, error) {
	s.mu.RLock()
	sess, exists := s.sessions[sessionID]
	s.mu.RUnlock()

	if !exists {
		return nil, fmt.Errorf("chat session not found: %s", sessionID)
	}

	// Update last used timestamp
	s.mu.Lock()
	sess.lastUsed = time.Now()
	s.mu.Unlock()

	// 1. Embed the user query
	queryEmbedding, err := s.aiClient.EmbedText(ctx, userMessage)
	if err != nil {
		return nil, fmt.Errorf("failed to embed query: %w", err)
	}

	// 2. Retrieve top-K relevant chunks
	results := sess.store.Search(queryEmbedding, topK)

	// 3. Build context from retrieved chunks
	var contextParts []string
	var sources []ChatSource
	for _, result := range results {
		if result.Score < 0.3 { // filter out low-relevance chunks
			continue
		}
		contextParts = append(contextParts, result.Chunk.Text)
		sources = append(sources, ChatSource{
			Section: result.Chunk.Metadata["section"],
			Title:   result.Chunk.Metadata["title"],
			Text:    result.Chunk.Text,
			Score:   result.Score,
		})
	}

	resumeContext := strings.Join(contextParts, "\n\n---\n\n")

	// 4. Build system prompt with RAG context
	systemPrompt := buildRAGSystemPrompt(sess.resume.Name, resumeContext)

	// 5. Build conversation messages (limit to last N)
	messages := buildConversationMessages(history, userMessage, maxHistory)

	// 6. Call LLM with context and history
	reply, err := s.aiClient.ChatWithHistory(ctx, systemPrompt, messages)
	if err != nil {
		return nil, fmt.Errorf("AI chat response failed: %w", err)
	}

	return &ChatMessageResponse{
		Reply:   reply,
		Sources: sources,
	}, nil
}

// HasSession checks if a session exists.
func (s *Service) HasSession(sessionID string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	_, exists := s.sessions[sessionID]
	return exists
}

// buildRAGSystemPrompt creates the system prompt with retrieved resume context.
func buildRAGSystemPrompt(candidateName, resumeContext string) string {
	return fmt.Sprintf(`You are an intelligent, friendly resume assistant for %s. You help the user understand and discuss their resume in detail.

You have access to the following sections from the user's resume:

--- RESUME CONTEXT ---
%s
--- END RESUME CONTEXT ---

Guidelines:
- Answer questions ONLY based on the resume context provided above.
- If the user asks about something not in their resume, politely say you don't have that information.
- Be conversational, helpful, and encouraging.
- When referencing specific details (projects, skills, experiences), cite them accurately.
- Provide actionable advice when asked for improvement suggestions.
- Format responses nicely using markdown when appropriate (bold, bullet points, etc).
- Keep responses concise but thorough (aim for 2-4 paragraphs max).
- If the user asks you to help prepare for interviews, relate your advice to their specific resume content.`, candidateName, resumeContext)
}

// buildConversationMessages converts chat history into OpenAI message format.
func buildConversationMessages(history []ChatMessage, currentMessage string, maxMsgs int) []openai.ChatCompletionMessage {
	var messages []openai.ChatCompletionMessage

	// Include recent history (up to maxMsgs)
	start := 0
	if len(history) > maxMsgs {
		start = len(history) - maxMsgs
	}
	for _, msg := range history[start:] {
		role := openai.ChatMessageRoleUser
		if msg.Role == "assistant" {
			role = openai.ChatMessageRoleAssistant
		}
		messages = append(messages, openai.ChatCompletionMessage{
			Role:    role,
			Content: msg.Content,
		})
	}

	// Add current user message
	messages = append(messages, openai.ChatCompletionMessage{
		Role:    openai.ChatMessageRoleUser,
		Content: currentMessage,
	})

	return messages
}

// cleanupLoop periodically removes expired sessions.
func (s *Service) cleanupLoop() {
	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		s.mu.Lock()
		now := time.Now()
		for id, sess := range s.sessions {
			if now.Sub(sess.lastUsed) > sessionTTL {
				delete(s.sessions, id)
				s.logger.Info("Cleaned up expired chat session", "sessionID", id)
			}
		}
		s.mu.Unlock()
	}
}
