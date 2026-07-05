package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"

	"github.com/ai-interview-coach/backend/internal/models"
	openai "github.com/sashabaranov/go-openai"
)

// Client wraps the OpenAI API client with application-specific methods.
type Client struct {
	client *openai.Client
	model  string
	logger *slog.Logger
}

// NewClient creates a new AI client with the given API key and model.
func NewClient(apiKey, model string) *Client {
	return &Client{
		client: openai.NewClient(apiKey),
		model:  model,
		logger: slog.Default().With("component", "ai"),
	}
}

// ParseResume sends raw resume text to the LLM and returns structured data.
func (c *Client) ParseResume(ctx context.Context, rawText string) (*models.ParsedResume, error) {
	c.logger.Info("Parsing resume with AI", "textLength", len(rawText))

	prompt := buildResumeParsingPrompt(rawText)

	resp, err := c.chatCompletion(ctx, prompt, "You are an expert resume parser. Extract structured information from resumes accurately.")
	if err != nil {
		return nil, fmt.Errorf("AI resume parsing failed: %w", err)
	}

	var resume models.ParsedResume
	if err := json.Unmarshal([]byte(resp), &resume); err != nil {
		return nil, fmt.Errorf("failed to parse AI response as resume JSON: %w", err)
	}

	return &resume, nil
}

// AnalyzeResume evaluates a parsed resume for strengths, weaknesses, and ATS compatibility.
func (c *Client) AnalyzeResume(ctx context.Context, resume *models.ParsedResume) (*models.ResumeAnalysis, error) {
	c.logger.Info("Analyzing resume with AI", "name", resume.Name)

	resumeJSON, err := json.Marshal(resume)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal resume: %w", err)
	}

	prompt := buildResumeAnalysisPrompt(string(resumeJSON))

	resp, err := c.chatCompletion(ctx, prompt, "You are an expert career counselor and ATS (Applicant Tracking System) specialist. Analyze resumes thoroughly.")
	if err != nil {
		return nil, fmt.Errorf("AI resume analysis failed: %w", err)
	}

	var analysis models.ResumeAnalysis
	if err := json.Unmarshal([]byte(resp), &analysis); err != nil {
		return nil, fmt.Errorf("failed to parse AI response as analysis JSON: %w", err)
	}

	return &analysis, nil
}

// GenerateQuestions creates personalized interview questions based on resume and analysis.
func (c *Client) GenerateQuestions(ctx context.Context, resume *models.ParsedResume, analysis *models.ResumeAnalysis, difficulty string) ([]models.Question, error) {
	c.logger.Info("Generating interview questions", "difficulty", difficulty)

	resumeJSON, _ := json.Marshal(resume)
	analysisJSON, _ := json.Marshal(analysis)

	prompt := buildQuestionGenerationPrompt(string(resumeJSON), string(analysisJSON), difficulty)

	resp, err := c.chatCompletion(ctx, prompt, "You are an expert technical interviewer at top tech companies like Google, Amazon, and Microsoft. Generate interview questions that are personalized to the candidate's resume.")
	if err != nil {
		return nil, fmt.Errorf("AI question generation failed: %w", err)
	}

	var result struct {
		Questions []models.Question `json:"questions"`
	}
	if err := json.Unmarshal([]byte(resp), &result); err != nil {
		return nil, fmt.Errorf("failed to parse AI response as questions JSON: %w", err)
	}

	// Assign IDs
	for i := range result.Questions {
		result.Questions[i].ID = i + 1
	}

	return result.Questions, nil
}

// EvaluateAnswer scores a user's answer to an interview question.
func (c *Client) EvaluateAnswer(ctx context.Context, question models.Question, userAnswer string, resume *models.ParsedResume) (*models.Answer, error) {
	c.logger.Info("Evaluating answer", "questionID", question.ID, "topic", question.Topic)

	resumeJSON, _ := json.Marshal(resume)
	questionJSON, _ := json.Marshal(question)

	prompt := buildAnswerEvaluationPrompt(string(questionJSON), userAnswer, string(resumeJSON))

	resp, err := c.chatCompletion(ctx, prompt, "You are a fair and thorough technical interviewer. Evaluate candidate answers honestly and provide constructive feedback.")
	if err != nil {
		return nil, fmt.Errorf("AI answer evaluation failed: %w", err)
	}

	var answer models.Answer
	if err := json.Unmarshal([]byte(resp), &answer); err != nil {
		return nil, fmt.Errorf("failed to parse AI response as answer evaluation JSON: %w", err)
	}

	answer.QuestionID = question.ID
	answer.QuestionText = question.Text
	answer.Topic = question.Topic
	answer.UserAnswer = userAnswer
	answer.Difficulty = question.Difficulty

	return &answer, nil
}

// GenerateReport creates a comprehensive interview report with study plan.
func (c *Client) GenerateReport(ctx context.Context, session *models.InterviewSession) (*models.InterviewReport, error) {
	c.logger.Info("Generating interview report", "sessionID", session.ID)

	sessionJSON, _ := json.Marshal(struct {
		Resume   models.ParsedResume   `json:"resume"`
		Analysis models.ResumeAnalysis `json:"analysis"`
		Answers  []models.Answer       `json:"answers"`
	}{
		Resume:   session.Resume,
		Analysis: session.Analysis,
		Answers:  session.Answers,
	})

	prompt := buildReportGenerationPrompt(string(sessionJSON))

	resp, err := c.chatCompletion(ctx, prompt, "You are a career development expert. Create detailed, actionable interview performance reports with personalized study plans.")
	if err != nil {
		return nil, fmt.Errorf("AI report generation failed: %w", err)
	}

	var report models.InterviewReport
	if err := json.Unmarshal([]byte(resp), &report); err != nil {
		return nil, fmt.Errorf("failed to parse AI response as report JSON: %w", err)
	}

	report.SessionID = session.ID
	report.Answers = session.Answers
	report.TotalQuestions = len(session.Questions)

	// Calculate correct count
	correct := 0
	for _, a := range session.Answers {
		if a.IsCorrect {
			correct++
		}
	}
	report.CorrectCount = correct

	// Assign rating
	report.Rating = calculateRating(report.OverallScore)

	// Generate heatmap colors
	for i := range report.Heatmap {
		report.Heatmap[i].Color = scoreToColor(report.Heatmap[i].Score)
	}

	return &report, nil
}

// RoastResume generates a humorous roast and serious critique of the resume.
func (c *Client) RoastResume(ctx context.Context, resume *models.ParsedResume, persona string) (*models.RoastResponse, error) {
	resumeJSON, err := json.MarshalIndent(resume, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("failed to marshal resume: %w", err)
	}

	prompt := buildRoastPrompt(string(resumeJSON), persona)
	respText, err := c.chatCompletion(ctx, prompt, "You are a tech recruiter conducting a humorous but helpful resume roast. Respond only with JSON.")
	if err != nil {
		return nil, fmt.Errorf("AI roast failed: %w", err)
	}

	var roast models.RoastResponse
	if err := json.Unmarshal([]byte(respText), &roast); err != nil {
		return nil, fmt.Errorf("failed to parse AI roast JSON: %w", err)
	}

	return &roast, nil
}

// MatchJob analyzes compatibility between a resume and target job description.
func (c *Client) MatchJob(ctx context.Context, req *models.JobMatchRequest) (*models.JobMatchResponse, error) {
	resumeJSON, err := json.MarshalIndent(req.Resume, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("failed to marshal resume: %w", err)
	}

	prompt := buildJobMatchPrompt(string(resumeJSON), req.JobDescription, req.TargetRole, req.TargetCompany)
	respText, err := c.chatCompletion(ctx, prompt, "You are an expert technical hiring manager analyzing job compatibility. Respond only with JSON.")
	if err != nil {
		return nil, fmt.Errorf("AI job matching failed: %w", err)
	}

	var match models.JobMatchResponse
	if err := json.Unmarshal([]byte(respText), &match); err != nil {
		return nil, fmt.Errorf("failed to parse AI job match JSON: %w", err)
	}

	return &match, nil
}

// chatCompletion makes a chat completion request to OpenAI with JSON mode.
func (c *Client) chatCompletion(ctx context.Context, userPrompt, systemPrompt string) (string, error) {
	resp, err := c.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model: c.model,
		Messages: []openai.ChatCompletionMessage{
			{Role: openai.ChatMessageRoleSystem, Content: systemPrompt},
			{Role: openai.ChatMessageRoleUser, Content: userPrompt},
		},
		ResponseFormat: &openai.ChatCompletionResponseFormat{
			Type: openai.ChatCompletionResponseFormatTypeJSONObject,
		},
		Temperature: 0.7,
		MaxTokens:   4096,
	})
	if err != nil {
		return "", err
	}

	if len(resp.Choices) == 0 {
		return "", fmt.Errorf("no response choices returned from AI")
	}

	return resp.Choices[0].Message.Content, nil
}

// calculateRating returns a human-readable rating based on the overall score.
func calculateRating(score int) string {
	switch {
	case score >= 90:
		return "Excellent"
	case score >= 75:
		return "Good"
	case score >= 60:
		return "Average"
	case score >= 40:
		return "Needs Improvement"
	default:
		return "Needs Significant Work"
	}
}

// scoreToColor returns a hex color string based on the score.
func scoreToColor(score int) string {
	switch {
	case score >= 90:
		return "#10b981" // emerald
	case score >= 75:
		return "#22c55e" // green
	case score >= 60:
		return "#f59e0b" // amber
	case score >= 40:
		return "#f97316" // orange
	default:
		return "#ef4444" // red
	}
}
