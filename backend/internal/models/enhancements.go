package models

// RoastResponse represents the AI's humorous roast of a resume.
type RoastResponse struct {
	Persona        string   `json:"persona"`         // e.g. "Gordon Ramsay of Code", "Silicon Valley VC", "FAANG Tech Lead"
	OverallRoast   string   `json:"overall_roast"`   // Brutal, funny introductory critique
	RedFlags       []string `json:"red_flags"`       // Hilarious red flags or buzzword overdoses
	BuzzwordBingo  []string `json:"buzzword_bingo"`  // Overused vague words detected (e.g. "synergized", "passionate")
	RatingScore    int      `json:"rating_score"`    // Survival probability out of 100
	RedemptionPlan []string `json:"redemption_plan"` // Serious, high-value advice to fix the resume
}

// RoastRequest represents a request to roast a resume with a specific persona.
type RoastRequest struct {
	Resume  ParsedResume `json:"resume"`
	Persona string       `json:"persona"` // "gordon", "vc", "faang"
}

// JobMatchRequest represents a request to match a resume against a target job description.
type JobMatchRequest struct {
	Resume         ParsedResume `json:"resume"`
	JobDescription string       `json:"job_description"`
	TargetRole     string       `json:"target_role,omitempty"`
	TargetCompany  string       `json:"target_company,omitempty"`
}

// JobMatchResponse represents the AI analysis of compatibility between resume and JD.
type JobMatchResponse struct {
	MatchPercentage int              `json:"match_percentage"`  // 0-100% compatibility score
	MatchedSkills   []string         `json:"matched_skills"`    // Skills from resume that match JD requirements
	MissingKeywords []string         `json:"missing_keywords"`  // Critical keywords/tools from JD missing in resume
	StrengthsForJob []string         `json:"strengths_for_job"` // Why the candidate is a strong fit
	GapsForJob      []string         `json:"gaps_for_job"`      // Areas where candidate falls short for this specific role
	TailoredBullets []TailoredBullet `json:"tailored_bullets"`  // AI-rewritten resume bullet points tailored for this JD
	InterviewFocus  []string         `json:"interview_focus"`   // Key technical topics likely to be asked in interview for this role
}

// TailoredBullet represents an AI-rewritten resume bullet point optimized for a specific job.
type TailoredBullet struct {
	Original string `json:"original"` // Existing bullet or concept from resume
	Tailored string `json:"tailored"` // Powerful action-oriented rewrite optimized for the JD
	Reason   string `json:"reason"`   // Why this rewrite works better for this role
}
