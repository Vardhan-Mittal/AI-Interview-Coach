# 🎯 AI Interview Coach

[![Live Demo on Vercel](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://resumenichod.vercel.app) [![Backend API Health](https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://resumenichod.onrender.com/api/health) [![Powered by Gemini](https://img.shields.io/badge/Powered%20By-Google%20Gemini%202.5-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/) [![License: MIT](https://img.shields.io/badge/License-MIT-F7DF1E?style=for-the-badge&logo=opensourceinitiative&logoColor=black)](LICENSE)

> Upload Resume → AI analyzes it → Generates personalized interview → Conducts adaptive interview → Scores performance → Gives improvement roadmap

An AI-powered interview preparation platform that provides personalized mock interviews based on your resume, with adaptive difficulty, topic-wise scoring, and actionable improvement roadmaps.

## 🌐 Live Demo & API Endpoints

- **🚀 Live Frontend (Vercel):** [https://resumenichod.vercel.app](https://resumenichod.vercel.app)
- **⚡ Live Backend API (Render):** [https://resumenichod.onrender.com/api/health](https://resumenichod.onrender.com/api/health)
- **🧠 AI Engine:** Version `2.5.0 (gemini 503-auto-failover engine + RAG chatbot)`

## ✨ Features

- **📄 Smart Resume Parsing** — Upload PDF resumes, AI extracts structured data (skills, projects, experience)
- **🔍 Resume Analysis** — Identifies strengths, weaknesses, missing skills, and ATS compatibility score
- **🎤 Personalized Interview** — 25 AI-generated questions weighted by your actual skills and projects
- **📊 Adaptive Difficulty** — Questions get harder when you're doing well, easier when struggling
- **📈 Topic-wise Scoring** — Detailed breakdown across OS, DBMS, OOP, DSA, Projects, and more
- **🗺️ Study Roadmap** — AI-generated daily study plan targeting your weakest areas
- **🔄 Interview Replay** — Review every question with correct answers and explanations
- **💬 Resume RAG Chatbot** — AI-powered chatbot using vector embeddings & RAG to answer questions about your resume in real-time

## 🤖 RAG Chatbot

The **Resume Assistant** is a floating chatbot widget available on every page. It uses **Retrieval-Augmented Generation (RAG)** to provide contextual, accurate answers about your resume.

### How It Works

```
1. Upload your resume (PDF)
2. Resume is parsed into structured data
3. Each section (skills, projects, experience, etc.) becomes a text chunk
4. Chunks are embedded using Gemini's text-embedding-004 model
5. Embeddings are stored in an in-memory vector store
6. When you ask a question:
   a. Your query is embedded
   b. Top-5 most relevant chunks are retrieved via cosine similarity
   c. Retrieved context is injected into the LLM prompt
   d. Gemini generates a contextual, personalized response
```

### Key Features

- **🔍 Semantic Search** — Finds the most relevant resume sections for your question
- **📎 Source Citations** — Shows which resume sections were used to generate each answer
- **💬 Conversational** — Maintains chat history for natural follow-up questions
- **⚡ Zero Dependencies** — In-memory vector store, no external database required
- **🗑️ Auto-cleanup** — Sessions expire after 1 hour of inactivity

### Example Questions

- "What are my top technical skills?"
- "Tell me about my projects"
- "How can I improve my resume for a backend role?"
- "What experience do I have with cloud technologies?"
- "Summarize my education background"

## 🏗️ Architecture

```
Next.js 15 (Frontend)
        │
    REST API
        │
Go Backend (Gin)
   ┌────┼────────┐
   │    │        │
Resume  AI    Chatbot
Parser       (RAG Engine)
   │    │        │
   │    │   ┌────┴────┐
   │    │   │         │
   │    │  Chunker  VectorStore
   │    │   │     (in-memory)
   │    │   │         │
   └────┼───┴─────────┘
        │
   PostgreSQL
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Go 1.24+, Gin, OpenAI API |
| **Database** | PostgreSQL (Phase 2) |
| **AI** | Google Gemini 2.5 Flash (LLM + Embeddings) |
| **RAG** | In-memory vector store, cosine similarity, text-embedding-004 |

## 📡 API Endpoints

### Resume
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/resume/upload` | Upload and parse a PDF resume |
| `POST` | `/api/resume/analyze` | Analyze parsed resume for strengths/weaknesses |
| `POST` | `/api/resume/roast` | Get a humorous roast of your resume |

### Interview
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/interview/start` | Start a personalized interview session |
| `POST` | `/api/interview/answer` | Submit an answer for evaluation |
| `GET`  | `/api/interview/:id/status` | Check interview session status |

### Report
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/report/:sessionId` | Get interview performance report |

### Job Match
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/job/match` | Match resume against a job description |

### Chat (RAG Chatbot)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat/init` | Initialize a RAG chat session with resume |
| `POST` | `/api/chat/message` | Send a message and get AI response |

## 🚀 Getting Started

### Prerequisites

- Go 1.24+
- Node.js 18+
- Google Gemini API Key (or OpenAI API Key)

### Backend

```bash
cd backend
cp .env.example .env
# Add your Gemini/OpenAI API key to .env
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
│   │   ├── ai/              # OpenAI/Gemini client, embeddings, prompts
│   │   ├── chatbot/         # RAG chatbot engine
│   │   │   ├── chunker.go   # Resume → semantic text chunks
│   │   │   ├── vectorstore.go # In-memory vector store + cosine similarity
│   │   │   ├── service.go   # RAG pipeline orchestrator
│   │   │   ├── handler.go   # HTTP handlers for chat API
│   │   │   └── models.go    # Request/response types
│   │   ├── config/          # Environment config
│   │   ├── interview/       # Interview engine
│   │   ├── middleware/       # CORS, logging
│   │   ├── models/          # Data structures
│   │   ├── report/          # Scoring & roadmap
│   │   └── resume/          # PDF parsing & analysis
│   └── routes/              # API route registration
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/
│   │   │   ├── ChatWidget.tsx  # Floating RAG chatbot widget
│   │   │   └── Providers.tsx   # Auth providers
│   │   ├── lib/
│   │   │   ├── api.ts       # API client
│   │   │   ├── chatApi.ts   # Chat API client
│   │   │   └── types.ts     # TypeScript types
│   │   └── hooks/           # Custom React hooks
│   └── prisma/              # Database schema
└── README.md
```

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
