package chatbot

import (
	"math"
	"sort"
	"sync"
)

// Chunk represents a piece of resume content with its embedding vector.
type Chunk struct {
	ID        string
	Text      string
	Embedding []float64
	Metadata  map[string]string // e.g. {"section": "project", "title": "AI Coach"}
}

// SearchResult holds a chunk and its similarity score to a query.
type SearchResult struct {
	Chunk Chunk
	Score float64
}

// VectorStore is a thread-safe in-memory vector store using cosine similarity.
type VectorStore struct {
	mu     sync.RWMutex
	chunks []Chunk
}

// NewVectorStore creates an empty vector store.
func NewVectorStore() *VectorStore {
	return &VectorStore{
		chunks: make([]Chunk, 0),
	}
}

// Add inserts a chunk into the vector store.
func (vs *VectorStore) Add(chunk Chunk) {
	vs.mu.Lock()
	defer vs.mu.Unlock()
	vs.chunks = append(vs.chunks, chunk)
}

// AddBatch inserts multiple chunks into the vector store.
func (vs *VectorStore) AddBatch(chunks []Chunk) {
	vs.mu.Lock()
	defer vs.mu.Unlock()
	vs.chunks = append(vs.chunks, chunks...)
}

// Search finds the top-K most similar chunks to the query embedding.
func (vs *VectorStore) Search(queryEmbedding []float64, topK int) []SearchResult {
	vs.mu.RLock()
	defer vs.mu.RUnlock()

	if len(vs.chunks) == 0 {
		return nil
	}

	results := make([]SearchResult, 0, len(vs.chunks))
	for _, chunk := range vs.chunks {
		score := cosineSimilarity(queryEmbedding, chunk.Embedding)
		results = append(results, SearchResult{
			Chunk: chunk,
			Score: score,
		})
	}

	// Sort by score descending
	sort.Slice(results, func(i, j int) bool {
		return results[i].Score > results[j].Score
	})

	// Return top-K
	if topK > len(results) {
		topK = len(results)
	}
	return results[:topK]
}

// Size returns the number of chunks stored.
func (vs *VectorStore) Size() int {
	vs.mu.RLock()
	defer vs.mu.RUnlock()
	return len(vs.chunks)
}

// cosineSimilarity computes the cosine similarity between two vectors.
// Returns a value between -1 and 1, where 1 means identical direction.
func cosineSimilarity(a, b []float64) float64 {
	if len(a) != len(b) || len(a) == 0 {
		return 0
	}

	var dotProduct, normA, normB float64
	for i := range a {
		dotProduct += a[i] * b[i]
		normA += a[i] * a[i]
		normB += b[i] * b[i]
	}

	normA = math.Sqrt(normA)
	normB = math.Sqrt(normB)

	if normA == 0 || normB == 0 {
		return 0
	}

	return dotProduct / (normA * normB)
}
