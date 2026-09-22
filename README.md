# Joblin

> **Status: Work in Progress** 🚧
> This project is under active development. Core features are functional, but UI polish, and one major feature (resume gap analysis) are still being built out.

An AI-assisted job application tracker. Paste in a job posting, and Joblin automatically extracts structured details (skills, seniority, salary range, remote policy), embeds it for semantic search, and — once fully built — compares it against your resume to highlight gaps.

Built as a personal project while job hunting, to track applications and explore practical AI-integration patterns (structured extraction, embeddings/semantic search, resume-JD matching) in a real full-stack app.

---

## Tech Stack

**Frontend**
- React + TypeScript (Vite)
- Plain inline styles for now (Tailwind / visual polish planned)

**Backend**
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL ([Neon](https://neon.tech), serverless Postgres)
- `pgvector` extension for embedding storage and similarity search

**AI**
- [Vercel AI SDK](https://sdk.vercel.ai/) (`ai` package) — provider-agnostic interface for all LLM calls
- [Groq](https://groq.com) (`openai/gpt-oss-120b`) — structured JD parsing via `generateObject` + Zod schema
- [Voyage AI](https://www.voyageai.com) — text embeddings for semantic search
- Chosen specifically for free-tier availability, since this is a self-funded portfolio project

**Auth**
- JWT (`jsonwebtoken`) + `bcrypt` for password hashing, implemented from scratch rather than a managed auth provider

---

## Features Implemented So Far

### ✅ Core CRUD
- Create, list, and view job applications (company, role, status, job description, notes)
- Status pipeline: `APPLIED`, `INTERVIEWING`, `OFFER`, `REJECTED`, `GHOSTED`

### ✅ AI-Powered JD Parsing
- On creating an application, the pasted job description is sent to Groq in the background (non-blocking — the API responds immediately, parsing happens asynchronously)
- Extracts: `skills`, `seniority`, `salaryRange`, `remotePolicy`
- Uses `generateObject` with a Zod schema for reliable structured output, rather than manually parsing free-text LLM responses
- Frontend polls for updates while parsing is in progress, and displays results as tags/badges once done

### ✅ Semantic Search ("Similar Applications")
- Each application's job description is embedded (Voyage AI) and stored in Postgres via `pgvector`
- A "Show similar applications" action on each card queries for the nearest embeddings (cosine similarity) among the logged-in user's own applications
- Demonstrates a genuine vector-search pattern: same-domain roles (e.g., two frontend jobs) score meaningfully higher similarity than unrelated ones (e.g., an agriculture role)

### ✅ Authentication
- Signup / login with hashed passwords (bcrypt) and JWT-based sessions
- All application routes are protected and scoped per-user — users can only see and query their own data
- Frontend stores the token in `localStorage`; a 401 response automatically logs the user out

### ✅ Frontend Structure
- Componentized into `hooks/` (`useAuth`, `useApplications`) and `components/` (`AuthForm`, `ApplicationForm`, `ApplicationList`, `ApplicationCard`)
- `App.tsx` composes these rather than holding all logic itself

---

## In Progress / Not Yet Built

- **Resume gap analysis** (the standout feature) — upload a resume (PDF), compare it against a job description, and surface matched/missing skills plus suggested resume bullet rewrites. Backend design is underway; not yet wired to the frontend.
- Resume upload via PDF (`multer` + `pdf-parse`) — extraction logic drafted, not yet fully tested end-to-end
- UI polish — currently minimal inline styling; a Tailwind-based, kanban/Jira-style board view is planned
- Deployment — not yet deployed; planned stack is Vercel (frontend) + Render/Railway (backend) + Neon (already in use for the database)
- Automated tests — none yet

---

## Local Setup

### Prerequisites
- Node.js 22 (LTS recommended — this project has hit compatibility issues with newer non-LTS Node versions)
- A [Neon](https://neon.tech) Postgres database (or any Postgres instance with the `vector` extension enabled)
- API keys: [Groq](https://console.groq.com) (free), [Voyage AI](https://www.voyageai.com) (free tier)

### Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=4000
DATABASE_URL="your-neon-connection-string"
JWT_SECRET="a-long-random-string"
GROQ_API_KEY="your-groq-key"
VOYAGE_API_KEY="your-voyage-key"
```

Enable the `pgvector` extension on your database (one-time, via your Postgres SQL editor):
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Run migrations:
```bash
npx prisma migrate dev
```

Start the dev server:
```bash
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`, expects the backend at `http://localhost:4000`.

---

## Architecture Notes

- **AI calls are abstracted behind the Vercel AI SDK**, with model selection centralized in `backend/src/ai/client.ts`. Swapping providers or models (e.g., a stronger model for gap analysis vs. a fast/cheap one for JD parsing) is a one-line change, not a refactor.
- **AI-generated background work follows a "respond first, process after" pattern** — creating an application returns immediately, while parsing and embedding happen asynchronously and update the record once complete. The frontend polls only while something is still pending.
- **Vector similarity search uses raw SQL** (`prisma.$queryRawUnsafe`) since Prisma doesn't natively support `pgvector`'s operators — this is intentionally isolated to a single query rather than spread throughout the codebase.

---

## Why These Choices

- **Groq over a paid model for JD parsing**: this is a high-volume, low-stakes extraction task (runs on every application added), so a fast, free, "good enough" model is the right tradeoff. A stronger/paid model is being considered specifically for the resume gap analysis feature, where output quality matters more and call volume is much lower (on-demand only).
- **Hand-rolled JWT auth over a managed provider (Clerk, Auth.js, etc.)**: for a portfolio project, understanding and being able to explain the full auth flow was prioritized over speed of integration.
- **Neon + pgvector over a dedicated vector database**: avoids introducing a second database/service for a personal project at this scale; Postgres with `pgvector` is sufficient and keeps the stack simpler.

---

*This README will be updated as the project progresses. Last updated: reflects state as of the resume-gap-analysis feature being under construction.*