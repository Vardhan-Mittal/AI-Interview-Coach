package models

// Question represents a single interview question.
type Question struct {
	ID         int      `json:"id"`
	Text       string   `json:"text"`
	Topic      string   `json:"topic"`
	Type       string   `json:"type"`       // mcq, open_ended, project, hr, coding
	Difficulty string   `json:"difficulty"` // easy, medium, hard
	Options    []string `json:"options,omitempty"`
}

// InterviewSession represents an active interview.
type InterviewSession struct {
	ID              string     `json:"id"`
	Resume          ParsedResume   `json:"resume"`
	Analysis        ResumeAnalysis `json:"analysis"`
	Questions       []Question `json:"questions"`
	CurrentIndex    int        `json:"current_index"`
	DifficultyLevel string     `json:"difficulty_level"` // easy, medium, hard
	Answers         []Answer   `json:"answers"`
	ConsecutiveCorrect int     `json:"consecutive_correct"`
	ConsecutiveWrong   int     `json:"consecutive_wrong"`
}

// Answer holds the user's answer and AI evaluation for a single question.
type Answer struct {
	QuestionID    int    `json:"question_id"`
	QuestionText  string `json:"question_text"`
	Topic         string `json:"topic"`
	UserAnswer    string `json:"user_answer"`
	IsCorrect     bool   `json:"is_correct"`
	Score         int    `json:"score"` // 0-100
	Explanation   string `json:"explanation"`
	CorrectAnswer string `json:"correct_answer"`
	Difficulty    string `json:"difficulty"`
}

// InterviewStartRequest is the request to start a new interview.
type InterviewStartRequest struct {
	Resume   ParsedResume   `json:"resume"`
	Analysis ResumeAnalysis `json:"analysis"`
}

// InterviewStartResponse is returned when starting an interview.
type InterviewStartResponse struct {
	SessionID    string   `json:"session_id"`
	TotalQuestions int    `json:"total_questions"`
	FirstQuestion Question `json:"first_question"`
}

// AnswerSubmitRequest is the request to submit an answer.
type AnswerSubmitRequest struct {
	SessionID  string `json:"session_id"`
	QuestionID int    `json:"question_id"`
	Answer     string `json:"answer"`
}

// AnswerSubmitResponse is returned after evaluating an answer.
type AnswerSubmitResponse struct {
	Evaluation    Answer    `json:"evaluation"`
	NextQuestion  *Question `json:"next_question,omitempty"` // nil if interview is complete
	IsComplete    bool      `json:"is_complete"`
	Progress      int       `json:"progress"`       // current question number
	Total         int       `json:"total"`           // total questions
	CurrentDifficulty string `json:"current_difficulty"`
}

// InterviewStatusResponse shows the current state of an interview.
type InterviewStatusResponse struct {
	SessionID       string `json:"session_id"`
	CurrentIndex    int    `json:"current_index"`
	TotalQuestions  int    `json:"total_questions"`
	DifficultyLevel string `json:"difficulty_level"`
	IsComplete      bool   `json:"is_complete"`
	AnsweredCount   int    `json:"answered_count"`
}
