# 🎯 AI Interview Coach

> Upload Resume → AI analyzes it → Generates personalized interview → Conducts adaptive interview → Scores performance → Gives improvement roadmap

An AI-powered interview preparation platform that provides personalized mock interviews based on your resume, with adaptive difficulty, topic-wise scoring, and actionable improvement roadmaps.

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
