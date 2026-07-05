"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { startInterview, submitAnswer } from "@/lib/api";
import type { ParsedResume, ResumeAnalysis, Question, Answer } from "@/lib/types";

export default function InterviewPage() {
  const router = useRouter();
  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(25);
  const [progress, setProgress] = useState(0);
  const [difficulty, setDifficulty] = useState("medium");
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [openAnswer, setOpenAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const [lastEvaluation, setLastEvaluation] = useState<Answer | null>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Edge!");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + " ";
        }
      }
      if (transcript) {
        setOpenAnswer((prev) => prev + (prev && !prev.endsWith(" ") ? " " : "") + transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  useEffect(() => {
    const storedResume = sessionStorage.getItem("parsedResume");
    const storedAnalysis = sessionStorage.getItem("resumeAnalysis");
    if (!storedResume || !storedAnalysis) {
      router.push("/upload");
      return;
    }
    const parsedResume = JSON.parse(storedResume) as ParsedResume;
    const parsedAnalysis = JSON.parse(storedAnalysis) as ResumeAnalysis;
    setResume(parsedResume);
    setAnalysis(parsedAnalysis);
    initializeInterview(parsedResume, parsedAnalysis);
  }, [router]);

  const initializeInterview = async (r: ParsedResume, a: ResumeAnalysis) => {
    setIsStarting(true);
    setError(null);
    try {
      const response = await startInterview(r, a);
      setSessionId(response.session_id);
      setTotalQuestions(response.total_questions);
      setCurrentQuestion(response.first_question);
      setProgress(0);
      sessionStorage.setItem("sessionId", response.session_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start interview.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!sessionId || !currentQuestion) return;

    const answer = currentQuestion.type === "mcq" ? selectedAnswer : openAnswer;
    if (!answer.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await submitAnswer(sessionId, currentQuestion.id, answer);
      setLastEvaluation(response.evaluation);
      setShowEvaluation(true);
      setProgress(response.progress);
      setDifficulty(response.current_difficulty);

      if (response.is_complete) {
        setIsComplete(true);
      } else if (response.next_question) {
        // Store next question to show after evaluation
        setTimeout(() => {
          setCurrentQuestion(response.next_question!);
          setShowEvaluation(false);
          setSelectedAnswer("");
          setOpenAnswer("");
          setLastEvaluation(null);
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = () => {
    setShowEvaluation(false);
    setSelectedAnswer("");
    setOpenAnswer("");
    setLastEvaluation(null);
  };

  const handleViewReport = () => {
    router.push("/report");
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy": return "var(--success)";
      case "medium": return "var(--warning)";
      case "hard": return "var(--error)";
      default: return "var(--text-muted)";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "mcq": return "Multiple Choice";
      case "open_ended": return "Open Ended";
      case "project": return "Project Question";
      case "coding": return "Coding";
      case "hr": return "HR";
      default: return type;
    }
  };

  if (!resume || !analysis) return null;

  return (
    <div className="bg-grid" style={{ minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)", background: "rgba(10, 10, 26, 0.8)", backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "inherit" }}>
            <span style={{ fontSize: "24px" }}>🎯</span>
            <span className="gradient-text" style={{ fontSize: "20px", fontWeight: 700 }}>InterviewCoach AI</span>
          </Link>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span className="badge" style={{ background: `${getDifficultyColor(difficulty)}22`, color: getDifficultyColor(difficulty), border: `1px solid ${getDifficultyColor(difficulty)}44` }}>
              {difficulty.toUpperCase()}
            </span>
            <span className="badge badge-info">{progress}/{totalQuestions}</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Progress</span>
            <span style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: "var(--accent-primary)" }}>
              {Math.round((progress / totalQuestions) * 100)}%
            </span>
          </div>
          <div className="progress-bar" style={{ height: "6px" }}>
            <div className="progress-bar-fill" style={{ width: `${(progress / totalQuestions) * 100}%` }} />
          </div>
        </div>

        {/* Starting */}
        {isStarting && (
          <div className="glass-card-static animate-pulse-glow" style={{ padding: "60px", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", border: "3px solid var(--border-subtle)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", margin: "0 auto 24px" }} className="animate-spin" />
            <p style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>Generating your personalized interview...</p>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Creating 25 questions based on your resume and skills</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: "16px 20px", background: "var(--error-soft)", border: "1px solid rgba(244, 63, 94, 0.3)", borderRadius: "var(--radius-md)", color: "var(--error)", fontSize: "14px", marginBottom: "24px" }}>
            ❌ {error}
          </div>
        )}

        {/* Question Card */}
        {currentQuestion && !isStarting && !isComplete && (
          <div className="animate-fade-in-up">
            {/* Question Header */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              <span className="badge badge-info">Q{progress + 1}</span>
              <span className="badge badge-neutral">{currentQuestion.topic}</span>
              <span className="badge badge-neutral">{getTypeLabel(currentQuestion.type)}</span>
              <span className="badge" style={{ background: `${getDifficultyColor(currentQuestion.difficulty)}22`, color: getDifficultyColor(currentQuestion.difficulty), border: `1px solid ${getDifficultyColor(currentQuestion.difficulty)}44` }}>
                {currentQuestion.difficulty}
              </span>
            </div>

            {/* Question */}
            <div className="glass-card-static" style={{ padding: "32px", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 600, lineHeight: 1.7 }}>
                {currentQuestion.text}
              </h2>
            </div>

            {/* Answer Input */}
            {!showEvaluation && (
              <>
                {currentQuestion.type === "mcq" && currentQuestion.options ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                    {currentQuestion.options.map((option, i) => (
                      <div
                        key={i}
                        className={`mcq-option ${selectedAnswer === option ? "selected" : ""}`}
                        onClick={() => setSelectedAnswer(option)}
                      >
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: `2px solid ${selectedAnswer === option ? "var(--accent-primary)" : "var(--border-subtle)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                          {selectedAnswer === option && (
                            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "var(--accent-primary)" }} />
                          )}
                        </div>
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ position: "relative", marginBottom: "24px" }}>
                    <textarea
                      className="answer-textarea"
                      placeholder="Type your answer here or click the microphone to speak aloud..."
                      value={openAnswer}
                      onChange={(e) => setOpenAnswer(e.target.value)}
                      style={{ marginBottom: "0", minHeight: "160px", paddingBottom: "54px" }}
                    />
                    {speechSupported && (
                      <div style={{ position: "absolute", bottom: "14px", right: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                        {isListening && (
                          <span className="badge badge-error animate-pulse" style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f43f5e" }} /> Listening... Speak now
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={toggleSpeechRecognition}
                          style={{
                            padding: "8px 14px",
                            borderRadius: "20px",
                            background: isListening ? "#f43f5e" : "rgba(99, 102, 241, 0.2)",
                            border: isListening ? "1px solid #f43f5e" : "1px solid var(--border-subtle)",
                            color: "white",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            transition: "all 0.2s"
                          }}
                          title="Speak your answer"
                        >
                          <span>{isListening ? "⏹️ Stop Recording" : "🎙️ Speak Answer"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="btn-primary"
                    onClick={handleSubmitAnswer}
                    disabled={isLoading || (currentQuestion.type === "mcq" ? !selectedAnswer : !openAnswer.trim())}
                  >
                    {isLoading ? (
                      <>
                        <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} className="animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      "Submit Answer →"
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Evaluation Feedback */}
            {showEvaluation && lastEvaluation && (
              <div className="animate-fade-in-up">
                <div className="glass-card-static" style={{ padding: "28px", marginBottom: "20px", borderColor: lastEvaluation.is_correct ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", background: lastEvaluation.is_correct ? "var(--success-soft)" : "var(--error-soft)" }}>
                      {lastEvaluation.is_correct ? "✓" : "✗"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: lastEvaluation.is_correct ? "var(--success)" : "var(--error)" }}>
                        {lastEvaluation.is_correct ? "Correct!" : "Incorrect"}
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                        Score: <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-primary)" }}>{lastEvaluation.score}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Explanation</div>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>{lastEvaluation.explanation}</p>
                  </div>

                  {/* Correct Answer */}
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Expected Answer</div>
                    <div style={{ padding: "12px 16px", background: "var(--success-soft)", borderRadius: "var(--radius-md)", fontSize: "14px", color: "var(--success)", lineHeight: 1.7 }}>
                      {lastEvaluation.correct_answer}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <button className="btn-primary" onClick={handleNextQuestion}>
                    Next Question →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interview Complete */}
        {isComplete && (
          <div className="glass-card-static animate-fade-in-up" style={{ padding: "60px", textAlign: "center" }}>
            <div style={{ fontSize: "64px", marginBottom: "24px" }}>🎉</div>
            <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "12px" }}>
              Interview <span className="gradient-text">Complete!</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "16px", marginBottom: "32px" }}>
              You answered all {totalQuestions} questions. View your detailed report now.
            </p>
            <button className="btn-primary" onClick={handleViewReport} style={{ fontSize: "17px", padding: "16px 36px" }}>
              📊 View Detailed Report →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
