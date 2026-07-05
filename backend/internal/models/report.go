package models

// InterviewReport is the complete scoring and analysis report after an interview.
type InterviewReport struct {
	SessionID           string         `json:"session_id"`
	OverallScore        int            `json:"overall_score"`
	TopicScores         map[string]int `json:"topic_scores"`
	ResumeUnderstanding int            `json:"resume_understanding"`
	ProjectKnowledge    int            `json:"project_knowledge"`
	Strengths           []string       `json:"strengths"`
	Weaknesses          []string       `json:"weaknesses"`
	Heatmap             []HeatmapEntry `json:"heatmap"`
	StudyPlan           []StudyDay     `json:"study_plan"`
	Recommendations     []string       `json:"recommendations"`
	Answers             []Answer       `json:"answers"` // for interview replay
	TotalQuestions      int            `json:"total_questions"`
	CorrectCount        int            `json:"correct_count"`
	Rating              string         `json:"rating"` // Excellent, Good, Average, Needs Work
}

// HeatmapEntry represents a single bar in the visual skill heatmap.
type HeatmapEntry struct {
	Topic string `json:"topic"`
	Score int    `json:"score"` // 0-100
	Color string `json:"color"` // hex color based on score
}

// StudyDay represents one day in the study roadmap.
type StudyDay struct {
	Day       string   `json:"day"`
	Topic     string   `json:"topic"`
	Hours     int      `json:"hours"`
	Resources []string `json:"resources"`
	Priority  string   `json:"priority"` // high, medium, low
}

// ReportRequest is the request to generate a report.
type ReportRequest struct {
	SessionID string `json:"session_id"`
}
