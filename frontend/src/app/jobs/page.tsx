"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { matchJob } from "@/lib/api";
import type { ParsedResume, JobMatchResponse } from "@/lib/types";

export default function JobsPage() {
  const router = useRouter();
  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jd, setJd] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JobMatchResponse | null>(null);
  const [scoreAnimated, setScoreAnimated] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem("parsedResume");
    if (stored) {
      setResume(JSON.parse(stored) as ParsedResume);
    }
  }, []);

  useEffect(() => {
    if (!result) return;
    const target = result.match_percentage;
    const duration = 1500;
    const steps = 50;
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
  }, [result]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) {
      setError("Please upload a resume first before matching against a job.");
      return;
    }
    if (!jd.trim()) {
      setError("Please paste a job description.");
      return;
    }

    setIsMatching(true);
    setError(null);
    try {
      const resp = await matchJob({
        resume,
        job_description: jd,
        target_role: role,
        target_company: company,
      });
      setResult(resp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Job matching failed.");
    } finally {
      setIsMatching(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "var(--success)";
    if (score >= 60) return "var(--warning)";
    return "var(--error)";
  };

  return (
    <div className="bg-grid" style={{ minHeight: "100vh", paddingBottom: "80px" }}>
      {/* Nav */}
      <nav style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)", background: "rgba(10, 10, 26, 0.8)", backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "inherit" }}>
            <span style={{ fontSize: "24px" }}>🎯</span>
            <span className="gradient-text" style={{ fontSize: "20px", fontWeight: 700 }}>InterviewCoach AI</span>
          </Link>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {resume ? (
              <Link href="/analysis" className="btn-secondary" style={{ padding: "6px 14px", fontSize: "13px", textDecoration: "none" }}>
                📊 Back to Analysis
              </Link>
            ) : (
              <Link href="/upload" className="btn-primary" style={{ padding: "6px 16px", fontSize: "13px", textDecoration: "none" }}>
                📄 Upload Resume
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
        <div className="animate-fade-in-up" style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="badge badge-info" style={{ marginBottom: "12px", display: "inline-block" }}>Phase 3 Enhancement</span>
          <h1 style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "12px" }}>
            AI Job Description <span className="gradient-text">Matcher</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "17px", maxWidth: "600px", margin: "0 auto" }}>
            Paste any internship or SDE job description to calculate compatibility, find keyword gaps, and get AI-tailored bullet points.
          </p>
        </div>

        {!resume && (
          <div className="glass-card-static" style={{ padding: "32px", textAlign: "center", marginBottom: "32px", border: "1px solid var(--warning)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--warning)", marginBottom: "8px" }}>⚠️ No Active Resume Found</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
              To check job compatibility, please upload your resume first.
            </p>
            <Link href="/upload" className="btn-primary" style={{ padding: "12px 28px", textDecoration: "none", display: "inline-block" }}>
              📄 Upload Resume Now →
            </Link>
          </div>
        )}

        {/* Input Form */}
        <div className="glass-card-static" style={{ padding: "32px", marginBottom: "40px" }}>
          <form onSubmit={handleAnalyze}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
                  Target Company (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Google, Microsoft, Zomato"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  style={{ width: "100%", padding: "12px 16px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", color: "white", fontSize: "15px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
                  Target Role (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SDE Intern, Backend Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ width: "100%", padding: "12px 16px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", color: "white", fontSize: "15px" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
                Paste Job Description <span style={{ color: "var(--accent-primary)" }}>*</span>
              </label>
              <textarea
                rows={8}
                placeholder="Paste the full job description or requirements here..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                required
                style={{ width: "100%", padding: "16px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", color: "white", fontSize: "14px", lineHeight: 1.6, resize: "vertical" }}
              />
            </div>

            {error && (
              <div style={{ padding: "14px 18px", background: "var(--error-soft)", color: "var(--error)", borderRadius: "var(--radius-md)", marginBottom: "20px", fontSize: "14px" }}>
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isMatching || !resume}
              className="btn-primary"
              style={{ width: "100%", padding: "16px", fontSize: "16px", fontWeight: 700, display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", opacity: (!resume || isMatching) ? 0.6 : 1 }}
            >
              {isMatching ? (
                <>
                  <div style={{ width: "20px", height: "20px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%" }} className="animate-spin" />
                  <span>Analyzing Compatibility & Tailoring Bullets...</span>
                </>
              ) : (
                <span>🚀 Calculate Match Score & Tailor Resume</span>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {result && !isMatching && (
          <div className="stagger animate-fade-in-up">
            {/* Score + Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px", marginBottom: "24px" }}>
              <div className="glass-card-static" style={{ padding: "32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px" }}>JD Match Score</h3>
                <div className="score-circle" style={{ marginBottom: "16px" }}>
                  <span style={{ fontSize: "48px", fontWeight: 900, fontFamily: "var(--font-mono)", color: getScoreColor(scoreAnimated) }} className="animate-count-up">
                    {scoreAnimated}
                  </span>
                  <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>%</span>
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  {result.match_percentage >= 75 ? "🔥 Strong fit! Highly likely to pass ATS screening." : result.match_percentage >= 50 ? "⚡ Moderate fit. Address missing keywords." : "⚠️ Low fit. Tailoring is critical."}
                </p>
              </div>

              <div className="glass-card-static" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
                  Candidate Fit Analysis
                </h3>
                
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ fontSize: "14px", color: "var(--success)", fontWeight: 700, marginBottom: "8px" }}>✔ Key Strengths for Role</h4>
                  <ul style={{ paddingLeft: "20px", margin: 0, color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.8 }}>
                    {result.strengths_for_job.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 style={{ fontSize: "14px", color: "var(--warning)", fontWeight: 700, marginBottom: "8px" }}>⚡ Potential Gaps</h4>
                  <ul style={{ paddingLeft: "20px", margin: 0, color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.8 }}>
                    {result.gaps_for_job.map((gap, idx) => (
                      <li key={idx}>{gap}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Matched vs Missing Keywords */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
              <div className="glass-card-static" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--success)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
                  ✅ Matched Requirements
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {result.matched_skills.map((sk, idx) => (
                    <span key={idx} className="badge badge-success" style={{ fontSize: "13px", padding: "6px 14px" }}>✔ {sk}</span>
                  ))}
                </div>
              </div>

              <div className="glass-card-static" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--error)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
                  ❌ Missing JD Keywords
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>Add these tools/concepts to your bullets if you have experience with them:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {result.missing_keywords.map((kw, idx) => (
                    <span key={idx} className="badge badge-error" style={{ fontSize: "13px", padding: "6px 14px" }}>+ {kw}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI-Tailored Bullets */}
            <div className="glass-card-static" style={{ padding: "32px", marginBottom: "24px", borderTop: "3px solid var(--accent-primary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "white", marginBottom: "4px" }}>
                    ✍️ AI-Tailored Resume Bullets
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>We rewrote your bullets to match this exact job description:</p>
                </div>
                <span className="badge badge-info" style={{ fontSize: "12px" }}>High Impact</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {result.tailored_bullets.map((tb, idx) => (
                  <div key={idx} style={{ padding: "20px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div style={{ padding: "12px", background: "rgba(244, 63, 94, 0.05)", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--error)" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--error)", textTransform: "uppercase", marginBottom: "4px" }}>Original Resume Bullet</div>
                        <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{tb.original}</div>
                      </div>
                      <div style={{ padding: "12px", background: "rgba(16, 185, 129, 0.05)", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--success)" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--success)", textTransform: "uppercase", marginBottom: "4px" }}>✨ Tailored for JD</div>
                        <div style={{ fontSize: "14px", color: "white", fontWeight: 600, lineHeight: 1.6 }}>{tb.tailored}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: "var(--accent-primary)" }}>💡 Why this works better:</span> {tb.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview Focus Topics */}
            <div className="glass-card-static" style={{ padding: "32px", marginBottom: "40px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
                🎯 Recommended Study Topics for {company || "This Role"} Interview
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {result.interview_focus.map((topic, idx) => (
                  <div key={idx} style={{ padding: "10px 18px", background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "30px", fontSize: "14px", color: "white", fontWeight: 600 }}>
                    📖 {topic}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
