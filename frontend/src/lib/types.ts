// ===== Resume Types =====

export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  summary: string;
  skills: string[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  achievements: string[];
  certifications?: string[];
}

export interface Project {
  name: string;
  description: string;
  tech_stack: string[];
  link?: string;
  highlights?: string[];
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string;
  highlights?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
  gpa?: string;
}

export interface ResumeAnalysis {
  strong_skills: string[];
  weak_areas: string[];
  missing_skills: string[];
  ats_score: number;
  ats_suggestions: string[];
  interview_weightage: Record<string, number>;
  overall_assessment: string;
}

export interface ResumeUploadResponse {
  resume: ParsedResume;
  raw_text?: string;
}

export interface ResumeAnalyzeResponse {
  analysis: ResumeAnalysis;
}

// ===== Interview Types =====

export interface Question {
  id: number;
  text: string;
  topic: string;
  type: 'mcq' | 'open_ended' | 'project' | 'coding' | 'hr';
  difficulty: 'easy' | 'medium' | 'hard';
  options?: string[];
}

export interface Answer {
  question_id: number;
  question_text: string;
  topic: string;
  user_answer: string;
  is_correct: boolean;
  score: number;
  explanation: string;
  correct_answer: string;
  difficulty: string;
}

export interface InterviewStartResponse {
  session_id: string;
  total_questions: number;
  first_question: Question;
}

export interface AnswerSubmitResponse {
  evaluation: Answer;
  next_question: Question | null;
  is_complete: boolean;
  progress: number;
  total: number;
  current_difficulty: string;
}

export interface InterviewStatusResponse {
  session_id: string;
  current_index: number;
  total_questions: number;
  difficulty_level: string;
  is_complete: boolean;
  answered_count: number;
}

// ===== Report Types =====

export interface InterviewReport {
  session_id: string;
  overall_score: number;
  topic_scores: Record<string, number>;
  resume_understanding: number;
  project_knowledge: number;
  strengths: string[];
  weaknesses: string[];
  heatmap: HeatmapEntry[];
  study_plan: StudyDay[];
  recommendations: string[];
  answers: Answer[];
  total_questions: number;
  correct_count: number;
  rating: string;
}

export interface HeatmapEntry {
  topic: string;
  score: number;
  color: string;
}

export interface StudyDay {
  day: string;
  topic: string;
  hours: number;
  resources: string[];
  priority: 'high' | 'medium' | 'low';
}

// ===== App State =====

export interface AppState {
  resume: ParsedResume | null;
  analysis: ResumeAnalysis | null;
  sessionId: string | null;
  report: InterviewReport | null;
}

// ===== Roast Types =====

export interface RoastResponse {
  persona: string;
  overall_roast: string;
  red_flags: string[];
  buzzword_bingo: string[];
  rating_score: number;
  redemption_plan: string[];
}

// ===== Job Match Types =====

export interface JobMatchRequest {
  resume: ParsedResume;
  job_description: string;
  target_role?: string;
  target_company?: string;
}

export interface TailoredBullet {
  original: string;
  tailored: string;
  reason: string;
}

export interface JobMatchResponse {
  match_percentage: number;
  matched_skills: string[];
  missing_keywords: string[];
  strengths_for_job: string[];
  gaps_for_job: string[];
  tailored_bullets: TailoredBullet[];
  interview_focus: string[];
}
