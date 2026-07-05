"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { analyzeResume, roastResume } from "@/lib/api";
import type { ParsedResume, ResumeAnalysis, RoastResponse } from "@/lib/types";

export default function AnalysisPage() {
  const router = useRouter();
  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [atsAnimated, setAtsAnimated] = useState(0);

  // Phase 2 enhancements state
  const [activeTab, setActiveTab] = useState<"ats" | "roast">("ats");
  const [roast, setRoast] = useState<RoastResponse | null>(null);
  const [isRoasting, setIsRoasting] = useState(false);
  const [persona, setPersona] = useState<string>("gordon");

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

  const runRoast = async (parsedResume: ParsedResume, selectedPersona: string) => {
    setIsRoasting(true);
    setError(null);
    try {
      const response = await roastResume(parsedResume, selectedPersona);
      setRoast(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Roast failed.");
    } finally {
      setIsRoasting(false);
    }
  };

  const handleTabChange = (tab: "ats" | "roast") => {
    setActiveTab(tab);
    if (tab === "roast" && !roast && resume) {
      runRoast(resume, persona);
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
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link href="/jobs" className="btn-secondary" style={{ padding: "6px 14px", fontSize: "13px", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>💼</span> JD Matcher
            </Link>
            <div style={{ display: "flex", gap: "8px" }}>
              <span className="badge badge-success">Step 1 ✓</span>
              <span className="badge badge-info">Step 2</span>
              <span className="badge badge-neutral">Analysis</span>
            </div>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
        <div className="animate-fade-in-up" style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "12px" }}>
            Resume <span className="gradient-text">Analysis</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "17px" }}>
            AI-powered assessment for {resume.name}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "36px" }}>
          <button
            onClick={() => handleTabChange("ats")}
            style={{
              padding: "12px 28px",
              borderRadius: "30px",
              fontWeight: 700,
              fontSize: "15px",
              border: activeTab === "ats" ? "2px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
              background: activeTab === "ats" ? "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))" : "rgba(255, 255, 255, 0.03)",
              color: "white",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span>📊</span> ATS & Skill Assessment
          </button>
          <button
            onClick={() => handleTabChange("roast")}
            style={{
              padding: "12px 28px",
              borderRadius: "30px",
              fontWeight: 700,
              fontSize: "15px",
              border: activeTab === "roast" ? "2px solid #f43f5e" : "1px solid var(--border-subtle)",
              background: activeTab === "roast" ? "linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(251, 146, 60, 0.2))" : "rgba(255, 255, 255, 0.03)",
              color: "white",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span>🔥</span> Roast My Resume <span className="badge badge-error" style={{ fontSize: "11px", padding: "2px 6px" }}>Viral</span>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: "16px 20px", background: "var(--error-soft)", border: "1px solid rgba(244, 63, 94, 0.3)", borderRadius: "var(--radius-md)", color: "var(--error)", fontSize: "14px", marginBottom: "24px" }}>
            ❌ {error}
            <button className="btn-secondary" style={{ marginLeft: "16px", padding: "6px 16px", fontSize: "13px" }} onClick={() => resume && (activeTab === "ats" ? runAnalysis(resume) : runRoast(resume, persona))}>
              Retry
            </button>
          </div>
        )}

        {/* TAB 1: ATS & SKILLS */}
        {activeTab === "ats" && (
          <div>
            {isAnalyzing && (
              <div className="glass-card-static animate-pulse-glow" style={{ padding: "60px", textAlign: "center" }}>
                <div style={{ width: "56px", height: "56px", border: "3px solid var(--border-subtle)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", margin: "0 auto 24px" }} className="animate-spin" />
                <p style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>Analyzing your resume...</p>
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Evaluating skills, identifying gaps, calculating ATS score</p>
              </div>
            )}

            {analysis && !isAnalyzing && (
              <div className="stagger animate-fade-in-up">
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

                {/* CTAs */}
                <div style={{ textAlign: "center", display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                  <button className="btn-primary" onClick={handleStartInterview} style={{ fontSize: "17px", padding: "16px 36px" }}>
                    🎤 Start Personalized Interview →
                  </button>
                  <Link href="/jobs" className="btn-secondary" style={{ fontSize: "17px", padding: "16px 36px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <span>💼</span> Try JD Matcher
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RESUME ROAST */}
        {activeTab === "roast" && (
          <div className="stagger animate-fade-in-up">
            {/* Persona Selector */}
            <div className="glass-card-static" style={{ padding: "24px", marginBottom: "24px", textAlign: "center" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
                Choose Your AI Recruiter Persona
              </h3>
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                {[
                  { id: "gordon", label: "👨‍🍳 Gordon Ramsay of Code", desc: "Savage culinary metaphors & raw skill shoutings" },
                  { id: "vc", label: "🚀 Silicon Valley VC", desc: "Obsessed with AI buzzwords, ARR & disruption" },
                  { id: "faang", label: "👔 Principal FAANG Engineer", desc: "Strict system design nitpicker & scalability judge" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setPersona(p.id); resume && runRoast(resume, p.id); }}
                    style={{
                      padding: "14px 20px",
                      borderRadius: "var(--radius-md)",
                      border: persona === p.id ? "2px solid #f43f5e" : "1px solid var(--border-subtle)",
                      background: persona === p.id ? "rgba(244, 63, 94, 0.15)" : "rgba(255, 255, 255, 0.03)",
                      color: "white",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                      minWidth: "220px",
                      flex: "1 1 220px",
                      maxWidth: "300px"
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>{p.label}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {isRoasting && (
              <div className="glass-card-static animate-pulse-glow" style={{ padding: "60px", textAlign: "center" }}>
                <div style={{ width: "56px", height: "56px", border: "3px solid var(--border-subtle)", borderTopColor: "#f43f5e", borderRadius: "50%", margin: "0 auto 24px" }} className="animate-spin" />
                <p style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px", color: "#f43f5e" }}>🔥 Preparing Your Brutal Roast...</p>
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>The AI recruiter is analyzing your buzzwords and tech stack...</p>
              </div>
            )}

            {roast && !isRoasting && (
              <div className="stagger animate-fade-in-up">
                {/* Overall Roast Card */}
                <div className="glass-card-static" style={{ padding: "32px", marginBottom: "24px", borderLeft: "4px solid #f43f5e", background: "rgba(244, 63, 94, 0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                    <span className="badge badge-error" style={{ fontSize: "13px", padding: "6px 12px" }}>🔥 Brutal Verdict ({persona === "gordon" ? "Chef Gordon" : persona === "vc" ? "Tech VC" : "FAANG Staff Engineer"})</span>
                    <span style={{ fontSize: "15px", fontWeight: 800, color: "#f43f5e", fontFamily: "var(--font-mono)" }}>Survival Probability: {roast.rating_score}%</span>
                  </div>
                  <p style={{ fontSize: "16px", lineHeight: 1.8, color: "var(--text-primary)", fontStyle: "italic", whiteSpace: "pre-line" }}>
                    &ldquo;{roast.overall_roast}&rdquo;
                  </p>
                </div>

                {/* Red Flags & Buzzword Bingo */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
                  <div className="glass-card-static" style={{ padding: "32px" }}>
                    <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#f43f5e", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
                      🚩 Hilarious Red Flags
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {roast.red_flags.map((flag, idx) => (
                        <div key={idx} style={{ display: "flex", gap: "10px", fontSize: "14px", color: "var(--text-secondary)" }}>
                          <span style={{ color: "#f43f5e", flexShrink: 0 }}>❌</span>
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card-static" style={{ padding: "32px" }}>
                    <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--warning)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
                      🎯 Buzzword Bingo
                    </h3>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>Overused fluff detected in your resume:</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {roast.buzzword_bingo.map((word, idx) => (
                        <span key={idx} className="badge badge-warning" style={{ fontSize: "13px", padding: "6px 14px" }}>
                          🗯️ {word}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Redemption Plan */}
                <div className="glass-card-static" style={{ padding: "32px", marginBottom: "40px", borderLeft: "4px solid var(--success)" }}>
                  <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--success)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
                    🛡️ Serious Redemption Plan
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>How to turn this roast into a 6-figure job offer:</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {roast.redemption_plan.map((step, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "12px", padding: "14px", background: "rgba(16, 185, 129, 0.05)", borderRadius: "var(--radius-md)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                        <span style={{ color: "var(--success)", fontWeight: 800 }}>{idx + 1}.</span>
                        <span style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTAs */}
                <div style={{ textAlign: "center", display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                  <button className="btn-primary" onClick={handleStartInterview} style={{ fontSize: "17px", padding: "16px 36px" }}>
                    🎤 Start Personalized Interview →
                  </button>
                  <Link href="/jobs" className="btn-secondary" style={{ fontSize: "17px", padding: "16px 36px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <span>💼</span> Check JD Compatibility
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
