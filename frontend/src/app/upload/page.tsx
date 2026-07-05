"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { uploadResume } from "@/lib/api";
import type { ParsedResume } from "@/lib/types";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  }, []);

  const validateAndSetFile = (f: File) => {
    setError(null);
    if (f.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.");
      return;
    }
    setFile(f);
    setParsedResume(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const response = await uploadResume(file);
      setParsedResume(response.resume);
      // Store in sessionStorage for the analysis page
      sessionStorage.setItem("parsedResume", JSON.stringify(response.resume));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleProceedToAnalysis = () => {
    router.push("/analysis");
  };

  return (
    <div className="bg-grid" style={{ minHeight: "100vh" }}>
      {/* Nav */}
      <nav
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "rgba(10, 10, 26, 0.8)",
          backdropFilter: "blur(20px)",
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
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <span style={{ fontSize: "24px" }}>🎯</span>
            <span className="gradient-text" style={{ fontSize: "20px", fontWeight: 700 }}>
              InterviewCoach AI
            </span>
          </Link>
          <div style={{ display: "flex", gap: "8px" }}>
            <span className="badge badge-info">Step 1</span>
            <span className="badge badge-neutral">Upload Resume</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px" }}>
        <div className="animate-fade-in-up" style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "12px" }}>
            Upload Your <span className="gradient-text">Resume</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "17px" }}>
            Drop your PDF resume below. Our AI will extract and structure all your information.
          </p>
        </div>

        {/* Dropzone */}
        {!parsedResume && (
          <div
            className={`dropzone animate-fade-in-up ${isDragging ? "active" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ animationDelay: "0.1s" }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
              }}
              accept=".pdf"
              style={{ display: "none" }}
            />

            {isUploading ? (
              <div style={{ padding: "20px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    border: "3px solid var(--border-subtle)",
                    borderTopColor: "var(--accent-primary)",
                    borderRadius: "50%",
                    margin: "0 auto 20px",
                  }}
                  className="animate-spin"
                />
                <p style={{ fontSize: "17px", fontWeight: 600, marginBottom: "8px" }}>
                  Parsing your resume with AI...
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                  Extracting skills, projects, experience, and more.
                </p>
              </div>
            ) : (
              <>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                  {file ? "📄" : "📁"}
                </div>
                <p style={{ fontSize: "17px", fontWeight: 600, marginBottom: "8px" }}>
                  {file ? file.name : "Drag & Drop your resume here"}
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
                  {file
                    ? `${(file.size / 1024).toFixed(1)} KB — Ready to upload`
                    : "Supports PDF files up to 10MB"}
                </p>
                {file ? (
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                    <button className="btn-primary" onClick={(e) => { e.stopPropagation(); handleUpload(); }}>
                      🚀 Parse with AI
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                    >
                      Change File
                    </button>
                  </div>
                ) : (
                  <button className="btn-secondary" style={{ fontSize: "14px" }}>
                    Browse Files
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="animate-fade-in"
            style={{
              marginTop: "20px",
              padding: "16px 20px",
              background: "var(--error-soft)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              borderRadius: "var(--radius-md)",
              color: "var(--error)",
              fontSize: "14px",
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* Parsed Resume Preview */}
        {parsedResume && (
          <div className="animate-fade-in-up" style={{ marginTop: "32px" }}>
            <div
              className="glass-card-static"
              style={{ padding: "32px", marginBottom: "24px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                  <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>
                    {parsedResume.name}
                  </h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                    {parsedResume.email}
                    {parsedResume.phone && ` • ${parsedResume.phone}`}
                  </p>
                </div>
                <span className="badge badge-success">✓ Parsed</span>
              </div>

              {parsedResume.summary && (
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                    Summary
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.7 }}>
                    {parsedResume.summary}
                  </p>
                </div>
              )}

              {/* Skills */}
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                  Skills ({parsedResume.skills.length})
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {parsedResume.skills.map((skill) => (
                    <span key={skill} className="badge badge-info">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              {parsedResume.projects.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                    Projects ({parsedResume.projects.length})
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {parsedResume.projects.map((project) => (
                      <div
                        key={project.name}
                        style={{
                          padding: "16px",
                          background: "rgba(255,255,255,0.02)",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                          {project.name}
                        </div>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                          {project.description}
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {project.tech_stack.map((tech) => (
                            <span
                              key={tech}
                              style={{
                                padding: "2px 8px",
                                fontSize: "11px",
                                background: "rgba(139, 92, 246, 0.15)",
                                color: "var(--accent-secondary)",
                                borderRadius: "var(--radius-full)",
                                border: "1px solid rgba(139, 92, 246, 0.25)",
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {parsedResume.experience.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                    Experience ({parsedResume.experience.length})
                  </h3>
                  {parsedResume.experience.map((exp) => (
                    <div key={exp.company + exp.role} style={{ marginBottom: "12px" }}>
                      <div style={{ fontWeight: 600 }}>{exp.role}</div>
                      <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                        {exp.company} • {exp.duration}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {parsedResume.education.length > 0 && (
                <div>
                  <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                    Education
                  </h3>
                  {parsedResume.education.map((edu) => (
                    <div key={edu.institution} style={{ marginBottom: "8px" }}>
                      <div style={{ fontWeight: 600, fontSize: "14px" }}>{edu.degree}</div>
                      <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                        {edu.institution} • {edu.year}
                        {edu.gpa && ` • GPA: ${edu.gpa}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action */}
            <div style={{ textAlign: "center" }}>
              <button className="btn-primary" onClick={handleProceedToAnalysis} style={{ fontSize: "17px", padding: "16px 36px" }}>
                🔍 Analyze Resume →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
