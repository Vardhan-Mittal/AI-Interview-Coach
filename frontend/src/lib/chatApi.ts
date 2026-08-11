import type {
  ParsedResume,
  ChatInitResponse,
  ChatMessage,
  ChatMessageResponse,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class ChatAPIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ChatAPIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ChatAPIError(errorData.error || `HTTP ${response.status}`, response.status);
  }
  return response.json();
}

// Initialize a chat session by sending the resume for chunking + embedding
export async function initChatSession(
  sessionId: string,
  resume: ParsedResume
): Promise<ChatInitResponse> {
  const response = await fetch(`${API_BASE}/api/chat/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, resume }),
  });

  return handleResponse<ChatInitResponse>(response);
}

// Send a chat message and receive an AI response with source citations
export async function sendChatMessage(
  sessionId: string,
  message: string,
  history: ChatMessage[]
): Promise<ChatMessageResponse> {
  const response = await fetch(`${API_BASE}/api/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message, history }),
  });

  return handleResponse<ChatMessageResponse>(response);
}
