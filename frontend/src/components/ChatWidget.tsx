"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { initChatSession, sendChatMessage } from "@/lib/chatApi";
import type { ChatMessage, ChatSource, ParsedResume } from "@/lib/types";

// Section emoji mapping for source badges
const sectionEmojis: Record<string, string> = {
  personal: "👤",
  skills: "💡",
  project: "🚀",
  experience: "💼",
  education: "🎓",
  achievements: "🏆",
  certifications: "📜",
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<ChatSource[]>([]);
  const [hasResume, setHasResume] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [pulseButton, setPulseButton] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check for resume in sessionStorage
  useEffect(() => {
    const checkResume = () => {
      const storedResume = sessionStorage.getItem("parsedResume");
      setHasResume(!!storedResume);
    };
    checkResume();
    // Re-check periodically (user may upload resume after opening chat)
    const interval = setInterval(checkResume, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Stop button pulse after first open
  useEffect(() => {
    if (isOpen) setPulseButton(false);
  }, [isOpen]);

  const initSession = useCallback(async () => {
    const storedResume = sessionStorage.getItem("parsedResume");
    if (!storedResume) {
      setError("No resume found. Please upload your resume first.");
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      const resume: ParsedResume = JSON.parse(storedResume);
      const newSessionId = `chat-${Date.now()}`;
      const response = await initChatSession(newSessionId, resume);
      setSessionId(response.session_id);
      setMessages([
        {
          role: "assistant",
          content: `👋 Hi ${resume.name || "there"}! I've analyzed your resume and I'm ready to help. Ask me anything about your skills, projects, experience, or how to improve your resume!`,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initialize chat. Please try again."
      );
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Auto-init session when opening if resume is available
  useEffect(() => {
    if (isOpen && hasResume && !sessionId && !isInitializing) {
      initSession();
    }
  }, [isOpen, hasResume, sessionId, isInitializing, initSession]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !sessionId) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);
    setSources([]);
    setShowSources(false);

    // Add user message
    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Send only last 10 messages as history (exclude the just-added one)
      const history = messages.slice(-10);
      const response = await sendChatMessage(sessionId, userMessage, history);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.reply },
      ]);

      if (response.sources && response.sources.length > 0) {
        setSources(response.sources);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send message."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "What are my top skills?",
    "Summarize my experience",
    "How can I improve my resume?",
    "Tell me about my projects",
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <button
        id="chat-widget-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className={pulseButton ? "animate-pulse-glow" : ""}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "var(--accent-gradient)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 24px rgba(99, 102, 241, 0.5)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isOpen ? "scale(0.9) rotate(90deg)" : "scale(1)",
          zIndex: 9999,
        }}
      >
        <span style={{ fontSize: "26px", lineHeight: 1 }}>
          {isOpen ? "✕" : "💬"}
        </span>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="chat-panel animate-slide-up"
          style={{
            position: "fixed",
            bottom: "96px",
            right: "24px",
            width: "420px",
            maxWidth: "calc(100vw - 48px)",
            height: "560px",
            maxHeight: "calc(100vh - 140px)",
            borderRadius: "var(--radius-xl)",
            background: "rgba(10, 10, 30, 0.95)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            boxShadow:
              "0 8px 48px rgba(0, 0, 0, 0.5), 0 0 60px rgba(99, 102, 241, 0.1)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9998,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background:
                "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))",
              borderBottom: "1px solid rgba(99, 102, 241, 0.15)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "var(--accent-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              🤖
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{ fontWeight: 700, fontSize: "15px", letterSpacing: "-0.3px" }}
              >
                Resume Assistant
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: sessionId ? "var(--success)" : "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: sessionId ? "var(--success)" : "var(--text-muted)",
                    display: "inline-block",
                  }}
                />
                {sessionId ? "Ready — RAG powered" : "Waiting for resume"}
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                fontSize: "16px",
                transition: "all 0.2s ease",
              }}
            >
              ─
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* No resume state */}
            {!hasResume && !isInitializing && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "var(--text-secondary)",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "var(--text-primary)",
                  }}
                >
                  Upload your resume first
                </p>
                <p style={{ fontSize: "13px", lineHeight: 1.6 }}>
                  Head to the{" "}
                  <a
                    href="/upload"
                    style={{ color: "var(--accent-primary)", textDecoration: "underline" }}
                  >
                    upload page
                  </a>{" "}
                  to upload your resume, then come back to chat!
                </p>
              </div>
            )}

            {/* Initializing state */}
            {isInitializing && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "var(--text-secondary)",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "3px solid var(--border-subtle)",
                    borderTopColor: "var(--accent-primary)",
                    borderRadius: "50%",
                    margin: "0 auto 16px",
                  }}
                  className="animate-spin"
                />
                <p style={{ fontSize: "14px", fontWeight: 600 }}>
                  Embedding your resume...
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    marginTop: "4px",
                  }}
                >
                  Building vector embeddings for RAG retrieval
                </p>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className="animate-fade-in"
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "12px 16px",
                    borderRadius:
                      msg.role === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.2))"
                        : "rgba(255, 255, 255, 0.04)",
                    border: `1px solid ${
                      msg.role === "user"
                        ? "rgba(99, 102, 241, 0.3)"
                        : "rgba(255, 255, 255, 0.06)"
                    }`,
                    fontSize: "14px",
                    lineHeight: 1.7,
                    color: "var(--text-primary)",
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div
                className="animate-fade-in"
                style={{ display: "flex", justifyContent: "flex-start" }}
              >
                <div
                  style={{
                    padding: "12px 20px",
                    borderRadius: "16px 16px 16px 4px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                  }}
                >
                  <span className="typing-dot" style={{ animationDelay: "0s" }} />
                  <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
                  <span className="typing-dot" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}

            {/* Source badges */}
            {sources.length > 0 && !isLoading && (
              <div className="animate-fade-in" style={{ marginTop: "-4px" }}>
                <button
                  onClick={() => setShowSources(!showSources)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    fontSize: "11px",
                    cursor: "pointer",
                    padding: "4px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  📎 {sources.length} source{sources.length > 1 ? "s" : ""} used{" "}
                  {showSources ? "▾" : "▸"}
                </button>
                {showSources && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "4px",
                      marginTop: "4px",
                    }}
                  >
                    {sources.map((source, idx) => (
                      <span
                        key={idx}
                        title={source.text}
                        style={{
                          padding: "2px 8px",
                          fontSize: "11px",
                          background: "rgba(99, 102, 241, 0.1)",
                          color: "var(--accent-primary)",
                          borderRadius: "var(--radius-full)",
                          border: "1px solid rgba(99, 102, 241, 0.2)",
                          cursor: "default",
                        }}
                      >
                        {sectionEmojis[source.section] || "📄"}{" "}
                        {source.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Suggested questions (shown when chat is empty or after init) */}
            {messages.length <= 1 && sessionId && !isLoading && (
              <div style={{ marginTop: "8px" }}>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontWeight: 600,
                  }}
                >
                  Try asking:
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                        setTimeout(() => handleSend(), 50);
                      }}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "var(--radius-md)",
                        padding: "8px 14px",
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.borderColor =
                          "rgba(99, 102, 241, 0.3)";
                        (e.target as HTMLButtonElement).style.background =
                          "rgba(99, 102, 241, 0.06)";
                        (e.target as HTMLButtonElement).style.color =
                          "var(--text-primary)";
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.borderColor =
                          "rgba(255,255,255,0.08)";
                        (e.target as HTMLButtonElement).style.background =
                          "rgba(255,255,255,0.03)";
                        (e.target as HTMLButtonElement).style.color =
                          "var(--text-secondary)";
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div
                className="animate-fade-in"
                style={{
                  padding: "10px 14px",
                  background: "var(--error-soft)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--error)",
                  fontSize: "13px",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              background: "rgba(0, 0, 0, 0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <input
                ref={inputRef}
                id="chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  sessionId
                    ? "Ask about your resume..."
                    : "Upload a resume to start chatting"
                }
                disabled={!sessionId || isLoading}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "var(--radius-full)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  fontFamily: "var(--font-sans)",
                  outline: "none",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(99, 102, 241, 0.4)";
                  e.target.style.boxShadow =
                    "0 0 16px rgba(99, 102, 241, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                id="chat-send-btn"
                onClick={handleSend}
                disabled={!input.trim() || isLoading || !sessionId}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background:
                    input.trim() && sessionId
                      ? "var(--accent-gradient)"
                      : "rgba(255,255,255,0.05)",
                  border: "none",
                  cursor:
                    input.trim() && sessionId ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                  opacity: input.trim() && sessionId ? 1 : 0.4,
                }}
              >
                ➤
              </button>
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: "6px",
                fontSize: "10px",
                color: "var(--text-muted)",
                opacity: 0.6,
              }}
            >
              Powered by Gemini + RAG
            </div>
          </div>
        </div>
      )}
    </>
  );
}
