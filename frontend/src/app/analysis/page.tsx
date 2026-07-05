"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { analyzeResume } from "@/lib/api";
import type { ParsedResume, ResumeAnalysis } from "@/lib/types";

export default function AnalysisPage() {
  const router = useRouter();
  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [atsAnimated, setAtsAnimated] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem("parsedResume");
    if (!stored) {
      router.push("/upload");
      return;
    }
    const parsed = JSON.parse(stored) as ParsedResume;
    setResume(parsed);
    runAnalysis(parsed);
  }, [router]);

  // Animate ATS score counter
  useEffect(() => {
    if (!analysis) return;
    const target = analysis.ats_score;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setAtsAnimated(target);
        clearInterval(interval);
      } else {
        setAtsAnimated(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [analysis]);

  const runAnalysis = async (parsedResume: ParsedResume) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await analyzeResume(parsedResume);
      setAnalysis(response.analysis);
      sessionStorage.setItem("resumeAnalysis", JSON.stringify(response.analysis));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartInterview = () => {
    router.push("/interview");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "var(--success)";
    if (score >= 60) return "var(--warning)";
    return "var(--error)";
  };

  if (!resume) return null;

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
            <span className="badge badge-success">Step 1 ✓</span>
            <span className="badge badge-info">Step 2</span>
            <span className="badge badge-neutral">Analysis</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
        <div className="animate-fade-in-up" style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "12px" }}>
            Resume <span className="gradient-text">Analysis</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "17px" }}>
            AI-powered analysis of {resume.name}&apos;s resume
          </p>
        </div>

        {/* Loading State */}
        {isAnalyzing && (
          <div className="glass-card-static animate-pulse-glow" style={{ padding: "60px", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", border: "3px solid var(--border-subtle)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", margin: "0 auto 24px" }} className="animate-spin" />
            <p style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>Analyzing your resume...</p>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Evaluating skills, identifying gaps, calculating ATS score</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: "16px 20px", background: "var(--error-soft)", border: "1px solid rgba(244, 63, 94, 0.3)", borderRadius: "var(--radius-md)", color: "var(--error)", fontSize: "14px", marginBottom: "24px" }}>
            ❌ {error}
            <button className="btn-secondary" style={{ marginLeft: "16px", padding: "6px 16px", fontSize: "13px" }} onClick={() => resume && runAnalysis(resume)}>
              Retry
            </button>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="stagger">
            {/* ATS Score + Overview */}
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px", marginBottom: "24px" }}>
              {/* ATS Score Circle */}
              <div className="glass-card-static" style={{ padding: "32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px" }}>ATS Score</h3>
                <div className="score-circle" style={{ marginBottom: "16px" }}>
                  <span style={{ fontSize: "48px", fontWeight: 900, fontFamily: "var(--font-mono)", color: getScoreColor(atsAnimated) }} className="animate-count-up">
                    {atsAnimated}
                  </span>
                  <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>/100</span>
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  {analysis.ats_score >= 80 ? "Great score! Your resume is ATS-friendly." : analysis.ats_score >= 60 ? "Good, but room for improvement." : "Needs significant improvement."}
                </p>
              </div>

              {/* Overall Assessment */}
              <div className="glass-card-static" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>Overall Assessment</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.8, marginBottom: "24px" }}>
                  {analysis.overall_assessment}
                </p>

                {/* Quick Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  <div style={{ textAlign: "center", padding: "12px", background: "var(--success-soft)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ fontSize: "24px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--success)" }}>{analysis.strong_skills.length}</div>
                    <div style={{ fontSize: "12px", color: "var(--success)" }}>Strong Skills</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "12px", background: "var(--warning-soft)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ fontSize: "24px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--warning)" }}>{analysis.weak_areas.length}</div>
                    <div style={{ fontSize: "12px", color: "var(--warning)" }}>Weak Areas</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "12px", background: "var(--error-soft)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ fontSize: "24px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--error)" }}>{analysis.missing_skills.length}</div>
                    <div style={{ fontSize: "12px", color: "var(--error)" }}>Missing</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strong Skills */}
            <div className="glass-card-static" style={{ padding: "32px", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
                ✅ Strong Skills
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {analysis.strong_skills.map((skill) => (
                  <span key={skill} className="badge badge-success" style={{ fontSize: "14px", padding: "6px 16px" }}>✔ {skill}</span>
                ))}
              </div>
            </div>

            {/* Weak Areas + Missing Skills */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
              <div className="glass-card-static" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
                  ⚠️ Weak Areas
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {analysis.weak_areas.map((area) => (
                    <div key={area} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                      <span style={{ color: "var(--warning)", flexShrink: 0 }}>⚡</span>
                      {area}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card-static" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
                  ❌ Missing Skills
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {analysis.missing_skills.map((skill) => (
                    <span key={skill} className="badge badge-error" style={{ fontSize: "13px" }}>+ {skill}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Interview Weightage */}
            <div className="glass-card-static" style={{ padding: "32px", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "24px" }}>
                📊 Interview Weightage
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {Object.entries(analysis.interview_weightage)
                  .sort(([, a], [, b]) => b - a)
                  .map(([topic, weight]) => (
                    <div key={topic} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: "120px", fontSize: "14px", fontWeight: 600, flexShrink: 0 }}>{topic}</div>
                      <div style={{ flex: 1 }}>
                        <div className="progress-bar">
                          <div className="progress-bar-fill" style={{ width: `${weight}%` }} />
                        </div>
                      </div>
                      <div style={{ width: "48px", textAlign: "right", fontSize: "14px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent-primary)" }}>
                        {weight}%
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* ATS Suggestions */}
            <div className="glass-card-static" style={{ padding: "32px", marginBottom: "40px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
                💡 ATS Improvement Suggestions
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {analysis.ats_suggestions.map((suggestion, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 16px", background: "rgba(99, 102, 241, 0.05)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                    <span style={{ color: "var(--accent-primary)", fontSize: "16px", flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Interview CTA */}
            <div style={{ textAlign: "center" }}>
              <button className="btn-primary" onClick={handleStartInterview} style={{ fontSize: "17px", padding: "16px 36px" }}>
                🎤 Start Personalized Interview →
              </button>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "12px" }}>
                25 AI-generated questions based on your resume and analysis
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
