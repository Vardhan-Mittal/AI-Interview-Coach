"use client";

import Link from "next/link";

const features = [
  {
    icon: "📄",
    title: "Smart Resume Parsing",
    description:
      "Upload your PDF resume and watch AI extract skills, projects, experience, and achievements into structured data.",
  },
  {
    icon: "🔍",
    title: "ATS Score & Analysis",
    description:
      "Get a detailed ATS compatibility score with actionable suggestions to improve your resume for job applications.",
  },
  {
    icon: "🎯",
    title: "Personalized Interview",
    description:
      "25 AI-generated questions weighted by YOUR skills and projects — not generic quizzes.",
  },
  {
    icon: "📊",
    title: "Adaptive Difficulty",
    description:
      "Like LeetCode, questions get harder when you're doing well and easier when you're struggling.",
  },
  {
    icon: "🗺️",
    title: "Topic-wise Scoring",
    description:
      "Detailed breakdown across OS, DBMS, OOP, DSA, Projects, React, ML — see exactly where you stand.",
  },
  {
    icon: "📈",
    title: "Study Roadmap",
    description:
      "AI-generated daily study plan targeting your weakest areas with real resources and time estimates.",
  },
];

const steps = [
  {
    number: "01",
    title: "Upload Resume",
    description: "Drop your PDF resume — AI extracts everything.",
  },
  {
    number: "02",
    title: "Get Analysis",
    description: "See your strengths, weaknesses, and ATS score.",
  },
  {
    number: "03",
    title: "Take Interview",
    description: "25 personalized questions with adaptive difficulty.",
  },
  {
    number: "04",
    title: "View Report",
    description: "Detailed scores, heatmap, and study roadmap.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-grid min-h-screen">
      {/* Navigation */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: "16px 24px",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-subtle)",
          background: "rgba(10, 10, 26, 0.8)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "24px" }}>🎯</span>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 700,
                letterSpacing: "-0.5px",
              }}
              className="gradient-text"
            >
              InterviewCoach AI
            </span>
          </div>
          <Link href="/upload" className="btn-primary" style={{ padding: "10px 24px", fontSize: "14px" }}>
            Get Started →
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="bg-glow"
        style={{
          paddingTop: "160px",
          paddingBottom: "100px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "0 24px",
            position: "relative",
            zIndex: 1,
          }}
          className="animate-fade-in-up"
        >
          <div
            className="badge badge-info"
            style={{ marginBottom: "24px", fontSize: "13px" }}
          >
            ✨ AI-Powered Interview Preparation
          </div>
          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-2px",
              marginBottom: "24px",
            }}
          >
            Your <span className="gradient-text">AI Interview</span>
            <br />
            Coach
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "var(--text-secondary)",
              maxWidth: "600px",
              margin: "0 auto 40px",
              lineHeight: 1.7,
            }}
          >
            Upload your resume → Get AI analysis → Practice with personalized
            interview questions → Receive detailed performance scores and a
            tailored study roadmap.
          </p>
          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/upload" className="btn-primary" style={{ fontSize: "17px", padding: "16px 36px" }}>
              Upload Resume & Start →
            </Link>
            <a href="#features" className="btn-secondary" style={{ fontSize: "17px", padding: "16px 36px" }}>
              See Features
            </a>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "48px",
              justifyContent: "center",
              marginTop: "64px",
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "25", label: "Personalized Questions" },
              { value: "8+", label: "Topic Categories" },
              { value: "100", label: "ATS Score Analysis" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div
                  className="gradient-text"
                  style={{
                    fontSize: "32px",
                    fontWeight: 800,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    marginTop: "4px",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px 100px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2
            style={{
              fontSize: "36px",
              fontWeight: 800,
              letterSpacing: "-1px",
              marginBottom: "16px",
            }}
          >
            Everything You Need
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "17px" }}>
            From resume analysis to interview simulation — all powered by AI.
          </p>
        </div>
        <div
          className="stagger"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass-card"
              style={{ padding: "32px" }}
            >
              <div style={{ fontSize: "36px", marginBottom: "16px" }}>
                {feature.icon}
              </div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "14px",
                  lineHeight: 1.7,
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "0 24px 120px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2
            style={{
              fontSize: "36px",
              fontWeight: 800,
              letterSpacing: "-1px",
              marginBottom: "16px",
            }}
          >
            How It Works
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "17px" }}>
            Four simple steps to ace your next interview.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "24px",
          }}
        >
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="glass-card"
              style={{
                padding: "32px 24px",
                textAlign: "center",
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div
                className="gradient-text"
                style={{
                  fontSize: "48px",
                  fontWeight: 900,
                  fontFamily: "var(--font-mono)",
                  marginBottom: "12px",
                  opacity: 0.6,
                }}
              >
                {step.number}
              </div>
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="bg-glow"
        style={{
          textAlign: "center",
          padding: "80px 24px",
          position: "relative",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2
            style={{
              fontSize: "32px",
              fontWeight: 800,
              marginBottom: "16px",
              letterSpacing: "-1px",
            }}
          >
            Ready to Ace Your Interview?
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: "32px",
              fontSize: "17px",
            }}
          >
            Upload your resume and start practicing in under 2 minutes.
          </p>
          <Link href="/upload" className="btn-primary" style={{ fontSize: "17px", padding: "16px 36px" }}>
            Get Started — It&apos;s Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "40px 24px",
          borderTop: "1px solid var(--border-subtle)",
          color: "var(--text-muted)",
          fontSize: "14px",
        }}
      >
        <p>
          Built with Next.js, Go, and OpenAI •{" "}
          <span className="gradient-text" style={{ fontWeight: 600 }}>
            InterviewCoach AI
          </span>
        </p>
      </footer>
    </div>
  );
}
