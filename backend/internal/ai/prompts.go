package ai

import "fmt"

// buildResumeParsingPrompt creates the prompt for extracting structured data from raw resume text.
func buildResumeParsingPrompt(rawText string) string {
	return fmt.Sprintf(`Parse the following resume text into structured JSON. Extract all information accurately.

Resume Text:
---
%s
---

Return a JSON object with exactly this structure:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number or empty string",
  "linkedin": "LinkedIn URL or empty string",
  "github": "GitHub URL or empty string",
  "summary": "Professional summary or objective if present, otherwise generate a brief one from the resume content",
  "skills": ["skill1", "skill2", ...],
  "projects": [
    {
      "name": "Project Name",
      "description": "What the project does",
      "tech_stack": ["tech1", "tech2"],
      "link": "URL if present or empty string",
      "highlights": ["key achievement 1", "key achievement 2"]
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Start - End",
      "description": "Role description",
      "highlights": ["achievement 1", "achievement 2"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Name",
      "year": "Year or Year Range",
      "gpa": "GPA if mentioned or empty string"
    }
  ],
  "achievements": ["Achievement 1", "Achievement 2"],
  "certifications": ["Certification 1", "Certification 2"]
}

Rules:
- Extract ALL skills mentioned anywhere in the resume (in skills section, projects, experience, etc.)
- For projects, extract the tech stack from the description if not explicitly listed
- If a field is not found, use an empty string or empty array as appropriate
- Do NOT invent or hallucinate information not present in the resume
- Return ONLY the JSON object, no additional text`, rawText)
}

// buildResumeAnalysisPrompt creates the prompt for analyzing a parsed resume.
func buildResumeAnalysisPrompt(resumeJSON string) string {
	return fmt.Sprintf(`Analyze the following parsed resume and provide a comprehensive evaluation.

Resume:
%s

Return a JSON object with exactly this structure:
{
  "strong_skills": ["List of skills the candidate clearly demonstrates strength in based on projects, experience, and skill listings"],
  "weak_areas": ["Areas where the resume shows gaps or lack of depth. Be specific, e.g., 'No cloud experience (AWS/GCP/Azure)', 'No testing/QA experience'"],
  "missing_skills": ["Important industry skills not mentioned at all, e.g., 'Docker', 'CI/CD', 'System Design', 'Redis'"],
  "ats_score": 85,
  "ats_suggestions": [
    "Specific actionable suggestions to improve the resume for ATS systems",
    "e.g., 'Add quantifiable metrics to project descriptions'",
    "e.g., 'Use action verbs like Built, Designed, Implemented'",
    "e.g., 'Add missing keywords: Docker, REST API, Cloud'"
  ],
  "interview_weightage": {
    "Projects": 35,
    "DSA": 15,
    "DBMS": 10,
    "OOP": 10,
    "OS": 10,
    "System Design": 5,
    "Machine Learning": 10,
    "Networking": 5
  },
  "overall_assessment": "A 2-3 sentence overall assessment of the candidate's profile"
}

Rules for ATS Score (0-100):
- Start at 50 (baseline)
- +10 for quantifiable achievements (metrics, numbers)
- +10 for strong action verbs
- +10 for relevant keywords matching common job descriptions
- +5 for proper formatting and clear sections
- +5 for relevant projects with tech stack
- +5 for certifications
- +5 for open source / GitHub contributions
- -10 for missing critical sections
- -5 for vague descriptions without specifics
- -5 for missing contact information

Rules for Interview Weightage:
- Total MUST equal 100
- Weight topics higher where the candidate has more content (projects, skills)
- Ensure at least 5%% for fundamentals (OS, DBMS, OOP) even if not explicitly mentioned
- Weight "Projects" at 25-40%% since project questions are most valuable in interviews`, resumeJSON)
}

// buildQuestionGenerationPrompt creates the prompt for generating personalized interview questions.
func buildQuestionGenerationPrompt(resumeJSON, analysisJSON, difficulty string) string {
	return fmt.Sprintf(`Generate 25 personalized interview questions based on this candidate's resume and analysis.

Resume:
%s

Analysis:
%s

Starting Difficulty Level: %s

Return a JSON object with exactly this structure:
{
  "questions": [
    {
      "text": "The question text",
      "topic": "Topic name (e.g., React, DSA, Projects, OS, DBMS, OOP, ML, SQL, System Design, HR)",
      "type": "mcq or open_ended or project or coding",
      "difficulty": "easy or medium or hard",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    }
  ]
}

Question Distribution Rules:
- Follow the interview_weightage from the analysis to distribute questions across topics
- Include at least 15 MCQs, 5 open-ended questions, and 5 project/resume-specific questions
- MCQs MUST have exactly 4 options with only ONE correct answer
- For "project" type questions, reference SPECIFIC projects from the resume by name
- For "coding" type, provide a problem description (no code template needed)

Difficulty Rules:
- If starting difficulty is "easy": 60%% easy, 30%% medium, 10%% hard
- If starting difficulty is "medium": 30%% easy, 40%% medium, 30%% hard
- If starting difficulty is "hard": 10%% easy, 30%% medium, 60%% hard

Question Quality Rules:
- Questions should be similar to real interview questions at Google, Amazon, Microsoft
- For resume skills (e.g., React), ask DEEP questions, not surface level
  - Bad: "What is React?"
  - Good: "What is the difference between useMemo and useCallback? When would you use each?"
- For projects, ask WHY decisions were made:
  - "Why did you choose [technology] for [project]? What alternatives did you consider?"
  - "How would you scale [project] to handle 10x more users?"
- For fundamentals (OS, DBMS, OOP), ask conceptual questions:
  - "Explain deadlock. How would you prevent it in your [project]?"
- Interleave topics — don't ask all questions from one topic consecutively
- Make questions progressively harder within each topic`, resumeJSON, analysisJSON, difficulty)
}

// buildAnswerEvaluationPrompt creates the prompt for evaluating a user's answer.
func buildAnswerEvaluationPrompt(questionJSON, userAnswer, resumeJSON string) string {
	return fmt.Sprintf(`Evaluate the following interview answer.

Question:
%s

Candidate's Answer:
%s

Candidate's Resume (for context):
%s

Return a JSON object with exactly this structure:
{
  "is_correct": true,
  "score": 85,
  "explanation": "Detailed explanation of why the answer is correct/incorrect and what could be improved",
  "correct_answer": "The ideal or expected answer to this question"
}

Scoring Rules (0-100):
- 90-100: Perfect or near-perfect answer demonstrating deep understanding
- 75-89: Good answer with minor gaps
- 60-74: Acceptable answer but missing key points
- 40-59: Partial understanding, significant gaps
- 20-39: Mostly incorrect but shows some awareness
- 0-19: Completely wrong or irrelevant

For MCQs:
- If the selected option is correct: score 100, is_correct true
- If incorrect: score 0, is_correct false
- Always explain WHY the correct answer is right

For Open-Ended:
- Evaluate completeness, accuracy, depth, and clarity
- Consider the candidate's background (from resume) when evaluating
- A project-specific answer that references their actual work gets bonus points
- is_correct is true if score >= 60

For Project Questions:
- Check if the answer demonstrates genuine understanding of their own project
- Evaluate technical depth and decision-making ability
- is_correct is true if score >= 60

Important: Be fair but rigorous. This is meant to prepare candidates for real interviews.`, questionJSON, userAnswer, resumeJSON)
}

// buildReportGenerationPrompt creates the prompt for generating the final interview report.
func buildReportGenerationPrompt(sessionJSON string) string {
	return fmt.Sprintf(`Generate a comprehensive interview performance report based on this session data.

Session Data:
%s

Return a JSON object with exactly this structure:
{
  "overall_score": 78,
  "topic_scores": {
    "Projects": 91,
    "React": 85,
    "DSA": 65,
    "DBMS": 55,
    "OOP": 70,
    "OS": 45,
    "Machine Learning": 90,
    "SQL": 72,
    "System Design": 60
  },
  "resume_understanding": 92,
  "project_knowledge": 88,
  "strengths": [
    "Strong understanding of React ecosystem and hooks",
    "Excellent project knowledge — can explain architectural decisions",
    "Good grasp of Machine Learning fundamentals"
  ],
  "weaknesses": [
    "Operating Systems concepts need significant improvement — struggled with memory management",
    "DBMS normalization concepts are weak",
    "System Design thinking needs development"
  ],
  "heatmap": [
    {"topic": "Projects", "score": 91},
    {"topic": "React", "score": 85},
    {"topic": "ML", "score": 90},
    {"topic": "SQL", "score": 72},
    {"topic": "OOP", "score": 70},
    {"topic": "DSA", "score": 65},
    {"topic": "System Design", "score": 60},
    {"topic": "DBMS", "score": 55},
    {"topic": "OS", "score": 45}
  ],
  "study_plan": [
    {
      "day": "Day 1-2",
      "topic": "Operating Systems",
      "hours": 3,
      "resources": ["GeeksforGeeks OS series", "Operating System Concepts by Silberschatz (Ch. 7-8)", "YouTube: Gate Smashers OS playlist"],
      "priority": "high"
    },
    {
      "day": "Day 3-4",
      "topic": "DBMS",
      "hours": 2,
      "resources": ["DBMS normalization tutorial", "SQL practice on HackerRank", "Database System Concepts by Korth"],
      "priority": "high"
    },
    {
      "day": "Day 5-6",
      "topic": "System Design",
      "hours": 2,
      "resources": ["System Design Primer (GitHub)", "Grokking System Design", "YouTube: Gaurav Sen"],
      "priority": "medium"
    },
    {
      "day": "Day 7",
      "topic": "Review & Practice",
      "hours": 2,
      "resources": ["Review weak areas", "Mock interview practice", "LeetCode easy-medium problems"],
      "priority": "medium"
    }
  ],
  "recommendations": [
    "Focus on OS fundamentals — this is a common interview topic you're currently weak in",
    "Practice DBMS normalization forms and SQL joins",
    "Your project knowledge is strong — leverage this in interviews",
    "Consider learning System Design basics for senior SDE interviews"
  ]
}

Rules:
- overall_score should be a weighted average based on topic_scores and interview_weightage
- topic_scores should only include topics that had questions in the interview
- Heatmap should be sorted by score (highest first)
- Study plan should prioritize weakest topics first (lowest scores)
- Study plan should be realistic (7-day plan, 2-3 hours per day)
- Resources should be REAL, well-known resources (not made up)
- Recommendations should be specific and actionable
- Be encouraging but honest`, sessionJSON)
}
