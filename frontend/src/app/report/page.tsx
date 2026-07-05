"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getReport } from "@/lib/api";
import type { InterviewReport } from "@/lib/types";

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scoreAnimated, setScoreAnimated] = useState(0);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "heatmap" | "studyplan" | "replay">("overview");

  useEffect(() => {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      router.push("/upload");
      return;
    }
    fetchReport(sessionId);
  }, [router]);

  // Animate score
  useEffect(() => {
    if (!report) return;
    const target = report.overall_score;
    const duration = 2000;
    const steps = 80;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setScoreAnimated(target);
        clearInterval(interval);
      } else {
        setScoreAnimated(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [report]);

  const fetchReport = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const data = await getReport(sessionId) as InterviewReport;
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report.");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "#10b981";
    if (score >= 75) return "#22c55e";
    if (score >= 60) return "#f59e0b";
    if (score >= 40) return "#f97316";
    return "#ef4444";
  };

  const getRatingEmoji = (rating: string) => {
    switch (rating) {
      case "Excellent": return "🏆";
      case "Good": return "👍";
      case "Average": return "📊";
      case "Needs Improvement": return "📈";
      default: return "💪";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "var(--error)";
      case "medium": return "var(--warning)";
      case "low": return "var(--success)";
      default: return "var(--text-muted)";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-grid" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="glass-card-static animate-pulse-glow" style={{ padding: "60px", textAlign: "center", maxWidth: "500px" }}>
          <div style={{ width: "56px", height: "56px", border: "3px solid var(--border-subtle)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", margin: "0 auto 24px" }} className="animate-spin" />
          <p style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>Generating your report...</p>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Analyzing your performance and creating a study plan</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-grid" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "24px" }}>
          <p style={{ color: "var(--error)", marginBottom: "16px" }}>❌ {error}</p>
          <Link href="/upload" className="btn-primary">Start Over</Link>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="bg-grid" style={{ minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)", background: "rgba(10, 10, 26, 0.8)", backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "inherit" }}>
            <span style={{ fontSize: "24px" }}>🎯</span>
            <span className="gradient-text" style={{ fontSize: "20px", fontWeight: 700 }}>InterviewCoach AI</span>
          </Link>
          <div style={{ display: "flex", gap: "8px" }}>
            <span className="badge badge-success">Complete ✓</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Header */}
        <div className="animate-fade-in-up" style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "12px" }}>
            Interview <span className="gradient-text">Report</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "17px" }}>
            {report.correct_count}/{report.total_questions} correct • {report.rating}
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "32px", background: "var(--bg-card)", borderRadius: "var(--radius-lg)", padding: "4px", border: "1px solid var(--border-subtle)" }}>
          {[
            { id: "overview" as const, label: "📊 Overview" },
            { id: "heatmap" as const, label: "🗺️ Heatmap" },
            { id: "studyplan" as const, label: "📚 Study Plan" },
            { id: "replay" as const, label: "🔄 Replay" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "12px 16px",
                border: "none",
                borderRadius: "var(--radius-md)",
                background: activeTab === tab.id ? "var(--accent-primary)" : "transparent",
                color: activeTab === tab.id ? "white" : "var(--text-secondary)",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "var(--font-sans)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="stagger">
            {/* Score + Rating */}
            <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px", marginBottom: "24px" }}>
              <div className="glass-card-static" style={{ padding: "40px", textAlign: "center" }}>
                <div className="score-circle" style={{ margin: "0 auto 20px" }}>
                  <span style={{ fontSize: "52px", fontWeight: 900, fontFamily: "var(--font-mono)", color: getScoreColor(scoreAnimated) }}>
                    {scoreAnimated}
                  </span>
                  <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>/100</span>
                </div>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>{getRatingEmoji(report.rating)}</div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: getScoreColor(report.overall_score) }}>
                  {report.rating}
                </div>
              </div>

              {/* Topic Scores Grid */}
              <div className="glass-card-static" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px" }}>Topic Scores</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
                  {Object.entries(report.topic_scores).map(([topic, score]) => (
                    <div key={topic} style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
                      <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-mono)", color: getScoreColor(score), marginBottom: "4px" }}>
                        {score}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{topic}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
              <div className="glass-card-static" style={{ padding: "28px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--success)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>💪 Strengths</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {report.strengths.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      <span style={{ color: "var(--success)", flexShrink: 0 }}>✓</span>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card-static" style={{ padding: "28px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--warning)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>📌 Areas to Improve</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {report.weaknesses.map((w, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      <span style={{ color: "var(--warning)", flexShrink: 0 }}>→</span>
                      {w}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass-card-static" style={{ padding: "28px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>🎯 Recommendations</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {report.recommendations.map((rec, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", padding: "12px 16px", background: "rgba(99, 102, 241, 0.05)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    <span style={{ color: "var(--accent-primary)", flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span>
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Heatmap Tab */}
        {activeTab === "heatmap" && (
          <div className="glass-card-static animate-fade-in-up" style={{ padding: "40px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "32px" }}>
              Skill <span className="gradient-text">Heatmap</span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {report.heatmap.map((entry, i) => (
                <div key={entry.topic} style={{ display: "flex", alignItems: "center", gap: "16px", animationDelay: `${i * 0.1}s` }} className="animate-fade-in-up">
                  <div style={{ width: "120px", fontSize: "14px", fontWeight: 600, flexShrink: 0 }}>{entry.topic}</div>
                  <div style={{ flex: 1, height: "32px", background: "rgba(255,255,255,0.04)", borderRadius: "var(--radius-sm)", overflow: "hidden", position: "relative" }}>
                    <div
                      className="heatmap-bar"
                      style={{
                        width: `${entry.score}%`,
                        background: `linear-gradient(90deg, ${entry.color}cc, ${entry.color})`,
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: "12px",
                      }}
                    >
                      {entry.score > 15 && (
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(0,0,0,0.7)" }}>
                          {entry.score}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ width: "50px", textAlign: "right", fontSize: "16px", fontWeight: 800, fontFamily: "var(--font-mono)", color: entry.color }}>
                    {entry.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Study Plan Tab */}
        {activeTab === "studyplan" && (
          <div className="stagger">
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
                Your <span className="gradient-text">7-Day Study Plan</span>
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                AI-generated roadmap targeting your weakest areas first
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {report.study_plan.map((day, i) => (
                <div key={i} className="glass-card-static" style={{ padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                        <span className="gradient-text" style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "18px" }}>{day.day}</span>
                        <span className="badge" style={{ background: `${getPriorityColor(day.priority)}22`, color: getPriorityColor(day.priority), border: `1px solid ${getPriorityColor(day.priority)}44`, fontSize: "11px" }}>
                          {day.priority} priority
                        </span>
                      </div>
                      <h4 style={{ fontSize: "18px", fontWeight: 700 }}>{day.topic}</h4>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "24px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent-primary)" }}>{day.hours}h</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>study time</div>
                    </div>
                  </div>
                  <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Resources</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {day.resources.map((resource, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-secondary)" }}>
                          <span style={{ color: "var(--accent-primary)" }}>📖</span>
                          {resource}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interview Replay Tab */}
        {activeTab === "replay" && (
          <div className="stagger">
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
                Interview <span className="gradient-text">Replay</span>
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                Review all {report.total_questions} questions with your answers and explanations
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {report.answers.map((answer, i) => (
                <div key={i} className="glass-card-static" style={{ overflow: "hidden" }}>
                  <div
                    onClick={() => setExpandedQuestion(expandedQuestion === i ? null : i)}
                    style={{
                      padding: "20px 24px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, background: answer.is_correct ? "var(--success-soft)" : "var(--error-soft)", color: answer.is_correct ? "var(--success)" : "var(--error)", flexShrink: 0 }}>
                        {answer.is_correct ? "✓" : "✗"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "14px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          Q{i + 1}: {answer.question_text}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                          {answer.topic} • {answer.difficulty}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "14px", color: getScoreColor(answer.score) }}>
                        {answer.score}
                      </span>
                      <span style={{ transform: expandedQuestion === i ? "rotate(180deg)" : "none", transition: "transform 0.2s", fontSize: "12px", color: "var(--text-muted)" }}>
                        ▼
                      </span>
                    </div>
                  </div>

                  {expandedQuestion === i && (
                    <div className="animate-fade-in" style={{ padding: "0 24px 24px", borderTop: "1px solid var(--border-subtle)" }}>
                      <div style={{ paddingTop: "16px" }}>
                        <div style={{ marginBottom: "12px" }}>
                          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Your Answer</div>
                          <div style={{ padding: "10px 14px", background: answer.is_correct ? "var(--success-soft)" : "var(--error-soft)", borderRadius: "var(--radius-sm)", fontSize: "13px", color: "var(--text-secondary)" }}>
                            {answer.user_answer}
                          </div>
                        </div>
                        <div style={{ marginBottom: "12px" }}>
                          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Correct Answer</div>
                          <div style={{ padding: "10px 14px", background: "var(--success-soft)", borderRadius: "var(--radius-sm)", fontSize: "13px", color: "var(--success)" }}>
                            {answer.correct_answer}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Explanation</div>
                          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>{answer.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Start Over */}
        <div style={{ textAlign: "center", marginTop: "48px", paddingBottom: "40px" }}>
          <Link href="/upload" className="btn-secondary" style={{ fontSize: "15px" }}>
            ↺ Start New Interview
          </Link>
        </div>
      </div>
    </div>
  );
}
