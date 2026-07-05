# 🎯 AI Interview Coach

[![Live Demo on Vercel](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://resumenichod.vercel.app) [![Backend API Health](https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://resumenichod.onrender.com/api/health) [![Powered by Gemini](https://img.shields.io/badge/Powered%20By-Google%20Gemini%202.5-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)

> Upload Resume → AI analyzes it → Generates personalized interview → Conducts adaptive interview → Scores performance → Gives improvement roadmap

An AI-powered interview preparation platform that provides personalized mock interviews based on your resume, with adaptive difficulty, topic-wise scoring, and actionable improvement roadmaps.

## 🌐 Live Demo & API Endpoints

- **🚀 Live Frontend (Vercel):** [https://resumenichod.vercel.app](https://resumenichod.vercel.app)
- **⚡ Live Backend API (Render):** [https://resumenichod.onrender.com/api/health](https://resumenichod.onrender.com/api/health)
- **🧠 AI Engine:** Version `2.4.0 (gemini 503-auto-failover engine)`

## ✨ Features

- **📄 Smart Resume Parsing** — Upload PDF resumes, AI extracts structured data (skills, projects, experience)
- **🔍 Resume Analysis** — Identifies strengths, weaknesses, missing skills, and ATS compatibility score
- **🎤 Personalized Interview** — 25 AI-generated questions weighted by your actual skills and projects
- **📊 Adaptive Difficulty** — Questions get harder when you're doing well, easier when struggling
- **📈 Topic-wise Scoring** — Detailed breakdown across OS, DBMS, OOP, DSA, Projects, and more
- **🗺️ Study Roadmap** — AI-generated daily study plan targeting your weakest areas
- **🔄 Interview Replay** — Review every question with correct answers and explanations

## 🏗️ Architecture

```
Next.js 15 (Frontend)
        │
    REST API
        │
Go Backend (Gin)
   ┌────┼────┐
   │    │    │
Resume  AI  Interview
Parser      Engine
   │    │    │
   └────┼────┘
        │
   PostgreSQL
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Go 1.24+, Gin, OpenAI API |
| **Database** | PostgreSQL (Phase 2) |
| **AI** | OpenAI GPT-4o-mini / GPT-4o |

## 🚀 Getting Started

### Prerequisites

- Go 1.24+
- Node.js 18+
- OpenAI API Key

### Backend

```bash
cd backend
cp .env.example .env
# Add your OpenAI API key to .env
go mod download
go run cmd/server/main.go
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── backend/
│   ├── cmd/server/          # Entry point
│   ├── internal/
│   │   ├── ai/              # OpenAI client & prompts
│   │   ├── config/          # Environment config
│   │   ├── interview/       # Interview engine
│   │   ├── middleware/       # CORS, logging
│   │   ├── models/          # Data structures
│   │   ├── report/          # Scoring & roadmap
│   │   └── resume/          # PDF parsing & analysis
│   └── routes/              # API route registration
├── frontend/
│   ├── app/                 # Next.js pages
│   ├── components/          # React components
│   ├── lib/                 # API client & types
│   └── hooks/               # Custom React hooks
└── README.md
```

## 📜 License

MIT
