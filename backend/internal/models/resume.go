package models

// ParsedResume holds the structured data extracted from a resume PDF.
type ParsedResume struct {
	Name         string       `json:"name"`
	Email        string       `json:"email"`
	Phone        string       `json:"phone"`
	LinkedIn     string       `json:"linkedin,omitempty"`
	GitHub       string       `json:"github,omitempty"`
	Summary      string       `json:"summary"`
	Skills       []string     `json:"skills"`
	Projects     []Project    `json:"projects"`
	Experience   []Experience `json:"experience"`
	Education    []Education  `json:"education"`
	Achievements []string     `json:"achievements"`
	Certifications []string   `json:"certifications,omitempty"`
}

// Project represents a project listed on the resume.
type Project struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	TechStack   []string `json:"tech_stack"`
	Link        string   `json:"link,omitempty"`
	Highlights  []string `json:"highlights,omitempty"`
}

// Experience represents a work experience entry.
type Experience struct {
	Company     string   `json:"company"`
	Role        string   `json:"role"`
	Duration    string   `json:"duration"`
	Description string   `json:"description"`
	Highlights  []string `json:"highlights,omitempty"`
}

// Education represents an education entry.
type Education struct {
	Institution string `json:"institution"`
	Degree      string `json:"degree"`
	Year        string `json:"year"`
	GPA         string `json:"gpa,omitempty"`
}

// ResumeAnalysis holds the AI analysis results of a parsed resume.
type ResumeAnalysis struct {
	StrongSkills       []string       `json:"strong_skills"`
	WeakAreas          []string       `json:"weak_areas"`
	MissingSkills      []string       `json:"missing_skills"`
	ATSScore           int            `json:"ats_score"`
	ATSSuggestions     []string       `json:"ats_suggestions"`
	InterviewWeightage map[string]int `json:"interview_weightage"`
	OverallAssessment  string         `json:"overall_assessment"`
}

// ResumeUploadResponse is returned after uploading and parsing a resume.
type ResumeUploadResponse struct {
	Resume  ParsedResume `json:"resume"`
	RawText string       `json:"raw_text,omitempty"`
}

// ResumeAnalyzeRequest is the request body for the analyze endpoint.
type ResumeAnalyzeRequest struct {
	Resume ParsedResume `json:"resume"`
}

// ResumeAnalyzeResponse is returned after analyzing a resume.
type ResumeAnalyzeResponse struct {
	Analysis ResumeAnalysis `json:"analysis"`
}
