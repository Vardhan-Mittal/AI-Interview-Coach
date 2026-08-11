package chatbot

import (
	"fmt"
	"strings"

	"github.com/ai-interview-coach/backend/internal/models"
)

// ChunkResume splits a ParsedResume into semantically meaningful text chunks
// with metadata for source attribution.
func ChunkResume(resume *models.ParsedResume) []TextChunk {
	var chunks []TextChunk

	// 1. Personal Info & Summary chunk
	var personalParts []string
	personalParts = append(personalParts, fmt.Sprintf("Name: %s", resume.Name))
	if resume.Email != "" {
		personalParts = append(personalParts, fmt.Sprintf("Email: %s", resume.Email))
	}
	if resume.Phone != "" {
		personalParts = append(personalParts, fmt.Sprintf("Phone: %s", resume.Phone))
	}
	if resume.LinkedIn != "" {
		personalParts = append(personalParts, fmt.Sprintf("LinkedIn: %s", resume.LinkedIn))
	}
	if resume.GitHub != "" {
		personalParts = append(personalParts, fmt.Sprintf("GitHub: %s", resume.GitHub))
	}
	if resume.Summary != "" {
		personalParts = append(personalParts, fmt.Sprintf("Professional Summary: %s", resume.Summary))
	}
	if len(personalParts) > 0 {
		chunks = append(chunks, TextChunk{
			Text:    strings.Join(personalParts, "\n"),
			Section: "personal",
			Title:   resume.Name,
		})
	}

	// 2. Skills chunk
	if len(resume.Skills) > 0 {
		chunks = append(chunks, TextChunk{
			Text:    fmt.Sprintf("Technical Skills: %s", strings.Join(resume.Skills, ", ")),
			Section: "skills",
			Title:   "Skills",
		})
	}

	// 3. One chunk per project
	for _, project := range resume.Projects {
		var parts []string
		parts = append(parts, fmt.Sprintf("Project: %s", project.Name))
		if project.Description != "" {
			parts = append(parts, fmt.Sprintf("Description: %s", project.Description))
		}
		if len(project.TechStack) > 0 {
			parts = append(parts, fmt.Sprintf("Technologies: %s", strings.Join(project.TechStack, ", ")))
		}
		if project.Link != "" {
			parts = append(parts, fmt.Sprintf("Link: %s", project.Link))
		}
		if len(project.Highlights) > 0 {
			parts = append(parts, fmt.Sprintf("Key Highlights: %s", strings.Join(project.Highlights, "; ")))
		}
		chunks = append(chunks, TextChunk{
			Text:    strings.Join(parts, "\n"),
			Section: "project",
			Title:   project.Name,
		})
	}

	// 4. One chunk per experience
	for _, exp := range resume.Experience {
		var parts []string
		parts = append(parts, fmt.Sprintf("Role: %s at %s", exp.Role, exp.Company))
		if exp.Duration != "" {
			parts = append(parts, fmt.Sprintf("Duration: %s", exp.Duration))
		}
		if exp.Description != "" {
			parts = append(parts, fmt.Sprintf("Description: %s", exp.Description))
		}
		if len(exp.Highlights) > 0 {
			parts = append(parts, fmt.Sprintf("Highlights: %s", strings.Join(exp.Highlights, "; ")))
		}
		chunks = append(chunks, TextChunk{
			Text:    strings.Join(parts, "\n"),
			Section: "experience",
			Title:   fmt.Sprintf("%s at %s", exp.Role, exp.Company),
		})
	}

	// 5. One chunk per education entry
	for _, edu := range resume.Education {
		var parts []string
		parts = append(parts, fmt.Sprintf("Degree: %s", edu.Degree))
		parts = append(parts, fmt.Sprintf("Institution: %s", edu.Institution))
		if edu.Year != "" {
			parts = append(parts, fmt.Sprintf("Year: %s", edu.Year))
		}
		if edu.GPA != "" {
			parts = append(parts, fmt.Sprintf("GPA: %s", edu.GPA))
		}
		chunks = append(chunks, TextChunk{
			Text:    strings.Join(parts, "\n"),
			Section: "education",
			Title:   edu.Institution,
		})
	}

	// 6. Achievements chunk
	if len(resume.Achievements) > 0 {
		chunks = append(chunks, TextChunk{
			Text:    fmt.Sprintf("Achievements: %s", strings.Join(resume.Achievements, "; ")),
			Section: "achievements",
			Title:   "Achievements",
		})
	}

	// 7. Certifications chunk
	if len(resume.Certifications) > 0 {
		chunks = append(chunks, TextChunk{
			Text:    fmt.Sprintf("Certifications: %s", strings.Join(resume.Certifications, "; ")),
			Section: "certifications",
			Title:   "Certifications",
		})
	}

	return chunks
}

// TextChunk represents a text chunk before embedding, with section metadata.
type TextChunk struct {
	Text    string
	Section string // personal, skills, project, experience, education, achievements, certifications
	Title   string // human-readable title for source attribution
}
