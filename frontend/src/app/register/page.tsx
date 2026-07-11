"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to register.");
        setLoading(false);
        return;
      }

      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        router.push("/login");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-grid"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        className="glass-card-static animate-fade-in-up"
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "40px 36px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "white",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "28px" }}>🎯</span>
            <span
              className="gradient-text"
              style={{ fontSize: "24px", fontWeight: 800 }}
            >
              ResumeNichod
            </span>
          </Link>
          <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
            Create Your Account
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Save your ATS scores & AI interview history persistently
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "8px",
              }}
            >
              Full Name (Optional)
            </label>
            <input
              type="text"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                color: "white",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "8px",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                color: "white",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "8px",
              }}
            >
              Password (min. 6 characters)
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                color: "white",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "12px 16px",
                background: "var(--error-soft)",
                color: "var(--error)",
                borderRadius: "var(--radius-md)",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "15px",
              fontWeight: 700,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
            fontSize: "14px",
            color: "var(--text-secondary)",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: "var(--accent-primary)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
