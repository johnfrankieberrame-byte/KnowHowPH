# KnowHow.ph

**The Philippine Career Intelligence Platform.** Know the path. Know the pay.

A single-page career discovery portal for Filipino students, career-shifters, BPO professionals,
and job-seekers: a searchable career explorer with real PH salary benchmarks, an 18-question
AI-powered career guidance quiz (Gemini), verified career-pivot success stories, and a market
intelligence dashboard.

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, `motion/react`, `lucide-react`, `recharts`
- **Backend:** Express.js + better-sqlite3, single server for API + Vite dev middleware / static prod assets
- **AI:** `@google/genai` (Gemini) for the career-quiz analysis endpoint

## Local setup

```bash
npm install
cp .env.example .env        # optionally add GEMINI_API_KEY for live AI quiz results
npm run dev                 # → http://localhost:3000
```

The SQLite database (`knowhow.db`) is created and seeded automatically on first run with 30+
careers across 11 Philippine industries (Technology, Outsourcing/BPO, Healthcare, Engineering,
Finance, Marketing, Education, Government, Creative, Trades, Entrepreneurship).

Without `GEMINI_API_KEY` set, the quiz UI still runs end-to-end — question flow, weighting,
navigation — but the final analysis step returns a clear error instead of a fabricated result.

## Scripts

```bash
npm run dev         # start the Express + Vite dev server on 0.0.0.0:3000
npm run build       # build the client bundle to dist/client
npm run start        # run the production server (serves dist/client)
npm run typecheck   # TypeScript project-wide check
npm run seed        # manually (re-)run the seed script (idempotent — no-ops if jobs exist)
```

## API

- `GET /api/jobs` — all seeded careers
- `GET /api/jobs/:id` — a single career
- `POST /api/jobs/batch` — bulk-insert careers (`{ jobs: [...] }`) in one transaction
- `POST /api/quiz/analyze` — `{ answers }` → Gemini-generated `QuizResult` (career matches,
  profile summary, education recommendation, skill tips, market insights)

## Data notes

Salary figures are illustrative Philippine market benchmarks (Metro Manila, Cebu, and remote
contractor indices) meant to orient job-seekers, not verified real-time labor statistics.
