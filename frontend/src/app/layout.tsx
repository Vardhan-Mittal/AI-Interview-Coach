import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Interview Coach — Ace Your Next Interview",
  description:
    "Upload your resume, get AI-powered analysis, practice with personalized mock interviews, and receive detailed performance reports with study roadmaps.",
  keywords: [
    "AI interview",
    "mock interview",
    "resume analysis",
    "ATS score",
    "interview preparation",
    "coding interview",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
