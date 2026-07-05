package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents a registered user or guest profile in the database.
type User struct {
	ID        string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Email     string         `gorm:"uniqueIndex;type:varchar(255)" json:"email"`
	Name      string         `gorm:"type:varchar(255)" json:"name"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// BeforeCreate generates a UUID for User if not present.
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	return
}

// ResumeEntity represents a persisted resume and its AI analysis in the database.
type ResumeEntity struct {
	ID        string          `gorm:"primaryKey;type:varchar(36)" json:"id"`
	UserID    string          `gorm:"index;type:varchar(36)" json:"user_id,omitempty"`
	Name      string          `gorm:"type:varchar(255)" json:"name"`
	RawText   string          `gorm:"type:text" json:"raw_text"`
	Parsed    ParsedResume    `gorm:"serializer:json" json:"parsed"`
	Analysis  *ResumeAnalysis `gorm:"serializer:json" json:"analysis,omitempty"`
	ATSScore  int             `json:"ats_score"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
}

func (r *ResumeEntity) BeforeCreate(tx *gorm.DB) (err error) {
	if r.ID == "" {
		r.ID = uuid.New().String()
	}
	return
}

// InterviewSessionEntity represents an active or completed interview session in the database.
type InterviewSessionEntity struct {
	ID         string     `gorm:"primaryKey;type:varchar(36)" json:"id"`
	UserID     string     `gorm:"index;type:varchar(36)" json:"user_id,omitempty"`
	ResumeID   string     `gorm:"index;type:varchar(36)" json:"resume_id,omitempty"`
	Difficulty string     `gorm:"type:varchar(50);default:'medium'" json:"difficulty"`
	Status     string     `gorm:"type:varchar(50);default:'in_progress'" json:"status"` // in_progress, completed
	Questions  []Question `gorm:"serializer:json" json:"questions"`
	Answers    []Answer   `gorm:"serializer:json" json:"answers"`
	CurrentIdx int        `json:"current_index"`
	Score      int        `json:"score"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

func (s *InterviewSessionEntity) BeforeCreate(tx *gorm.DB) (err error) {
	if s.ID == "" {
		s.ID = uuid.New().String()
	}
	return
}

// ReportEntity represents an AI-graded performance report in the database.
type ReportEntity struct {
	ID              string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	SessionID       string         `gorm:"uniqueIndex;type:varchar(36)" json:"session_id"`
	OverallScore    int            `json:"overall_score"`
	Rating          string         `gorm:"type:varchar(100)" json:"rating"`
	TopicScores     map[string]int `gorm:"serializer:json" json:"topic_scores"`
	Heatmap         []HeatmapEntry `gorm:"serializer:json" json:"heatmap"`
	StudyPlan       []StudyDay     `gorm:"serializer:json" json:"study_plan"`
	Recommendations []string       `gorm:"serializer:json" json:"recommendations"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
}

func (r *ReportEntity) BeforeCreate(tx *gorm.DB) (err error) {
	if r.ID == "" {
		r.ID = uuid.New().String()
	}
	return
}
