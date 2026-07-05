import type {
  ResumeUploadResponse,
  ResumeAnalyzeResponse,
  ParsedResume,
  ResumeAnalysis,
  InterviewStartResponse,
  AnswerSubmitResponse,
  RoastResponse,
  JobMatchRequest,
  JobMatchResponse,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class APIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'APIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new APIError(errorData.error || `HTTP ${response.status}`, response.status);
  }
  return response.json();
}

// ===== Resume API =====

export async function uploadResume(file: File): Promise<ResumeUploadResponse> {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await fetch(`${API_BASE}/api/resume/upload`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse<ResumeUploadResponse>(response);
}

export async function analyzeResume(resume: ParsedResume): Promise<ResumeAnalyzeResponse> {
  const response = await fetch(`${API_BASE}/api/resume/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume }),
  });

  return handleResponse<ResumeAnalyzeResponse>(response);
}

export async function roastResume(resume: ParsedResume, persona: string): Promise<RoastResponse> {
  const response = await fetch(`${API_BASE}/api/resume/roast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume, persona }),
  });

  return handleResponse<RoastResponse>(response);
}

// ===== Job Match API =====

export async function matchJob(req: JobMatchRequest): Promise<JobMatchResponse> {
  const response = await fetch(`${API_BASE}/api/job/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  return handleResponse<JobMatchResponse>(response);
}

// ===== Interview API =====

export async function startInterview(
  resume: ParsedResume,
  analysis: ResumeAnalysis
): Promise<InterviewStartResponse> {
  const response = await fetch(`${API_BASE}/api/interview/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume, analysis }),
  });

  return handleResponse<InterviewStartResponse>(response);
}

export async function submitAnswer(
  sessionId: string,
  questionId: number,
  answer: string
): Promise<AnswerSubmitResponse> {
  const response = await fetch(`${API_BASE}/api/interview/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      question_id: questionId,
      answer,
    }),
  });

  return handleResponse<AnswerSubmitResponse>(response);
}

// ===== Report API =====

export async function getReport(sessionId: string) {
  const response = await fetch(`${API_BASE}/api/report/${sessionId}`);
  return handleResponse(response);
}

// ===== Health API =====

export async function healthCheck() {
  const response = await fetch(`${API_BASE}/api/health`);
  return handleResponse(response);
}
