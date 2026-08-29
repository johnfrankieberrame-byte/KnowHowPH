# KnowHow PH

**KnowHow** is a career discovery and guidance platform for the Philippines. It helps senior high
school students, college students, fresh graduates, career shifters, and freelancers answer:

- What careers exist, and what do they actually involve?
- What skills, education, and certifications does a path require?
- What are typical salary ranges, demand, and remote/freelance prospects — clearly labeled as
  estimates, never presented as verified fact unless they are?
- Which careers fit *my* personality, skills, and circumstances?
- Which schools, programs, or self-learning paths can get me there?

This repository is a working, end-to-end **proof-of-concept (POC) MVP**: real data model, real
deterministic scoring engine, real (optional) Gemini AI enrichment, real admin CMS — backed by
clearly-labeled illustrative seed data rather than live labor-market feeds.

---

## Contents

- [Feature list](#feature-list)
- [Architecture overview](#architecture-overview)
- [Local setup](#local-setup)
- [Database: migrations & seed data](#database-migrations--seed-data)
- [Environment variables](#environment-variables)
- [Running tests](#running-tests)
- [Gemini configuration & fallback behavior](#gemini-configuration--fallback-behavior)
- [POC data & source labeling](#poc-data--source-labeling)
- [Deployment (Vercel + Supabase)](#deployment-vercel--supabase)
- [Known MVP limitations](#known-mvp-limitations)
- [Roadmap](#roadmap)

---

## Feature list

**Public**
- Homepage with hero, live search-with-suggestions, browse-by-industry, featured careers, quiz CTA
- Career explorer: full-text-ish search, multi-filter (industry, category, education level, salary
  band, demand, saturation, remote/freelance viability, entry difficulty, data status, skills,
  work-style tags), URL-synced filters, server-side pagination, accessible mobile filter drawer
- Career detail pages: at-a-glance card, responsibilities, technical/human skills, work
  environment, education/certification pathways, suggested schools & programs, career progression,
  "good fit if / may be challenging if," a transparent **data & sources panel**, related careers,
  JSON-LD (`Occupation` + `BreadcrumbList`)
- Compare up to 3 careers side-by-side
- Industries & categories pages (3-level hierarchy: Industry → Category → Career)
- Schools & programs directory with filters, school/program detail pages
- Career-match quiz: ~35 questions across 6 weighted sections, autosaved locally, resumable,
  deterministic scoring with a full transparent breakdown, optional Gemini-generated explanation
- `/about` methodology & source policy, `/privacy`, `/terms`

**Authenticated (Supabase Auth)**
- `/account`: profile summary, data-deletion control
- `/account/saved`: saved careers
- `/account/quiz-results`: quiz history
- Save/unsave careers from any career detail page
- Save an anonymous quiz result to your account after signing in

**Admin (`ADMIN` role)**
- Dashboard with content counts and a "needs attention" review-queue teaser
- CRUD for industries, categories, careers (core fields, metrics, source references, quiz trait
  profile), schools, programs, data sources
- Publish / mark-reviewed actions with `AdminAuditLog` trail
- Review queue for stale/POC/needs-review content
- Read-only quiz structure inspector

**Platform**
- Zod validation everywhere input crosses a trust boundary (API routes, Gemini output)
- Consistent `{ error: { code, message, fieldErrors? } }` API error shape
- Rate limiting on quiz submission and AI insight generation
- Analytics abstraction (no-ops without PostHog config; never sends raw answers/PII)
- `sitemap.xml`, `robots.txt`, per-page metadata, Open Graph/Twitter cards
- Security headers (CSP, X-Frame-Options, etc.) via `next.config.ts`
- Vitest unit/integration tests + Playwright E2E tests

---

## Architecture overview

```text
app/
  (public)/            Homepage, careers, industries, categories, schools, programs, quiz, account
  admin/                Admin CMS (role-protected)
  api/                  Route handlers (careers, industries, quiz, saved-careers, admin/*, search)
components/
  ui/                   shadcn-style accessible primitives (Radix + Tailwind + CVA)
  careers/ quiz/ schools/ admin/ layout/   Feature components
lib/
  auth/                 Supabase server/browser clients, session + role helpers
  db/                   Prisma client singleton + query modules (server-only)
  quiz/                 Trait taxonomy, deterministic scoring engine, reason generation
  ai/                   Server-only Gemini service + Zod-validated output schema
  search/                Career search/filter/sort implementation
  validations/           Zod schemas for every API input
  analytics/             Client-side analytics abstraction
  rate-limit.ts           In-memory token-bucket limiter
prisma/
  schema.prisma           Full data model (35 models, provenance-first)
  seed.ts + seed-data/     20 careers, 9 industries, 12 schools, 22 programs, 35 quiz questions
tests/
  unit/ integration/ e2e/
docs/
  METHODOLOGY.md
```

**Stack:** Next.js 15 (App Router, TypeScript, RSC), Tailwind CSS, Radix-based UI kit, PostgreSQL +
Prisma, Supabase Auth, Zod, TanStack Query (client caching only), React Hook Form, Gemini via
`@google/genai`, Vitest, Playwright.

**Design principle:** the deterministic quiz scorer (`lib/quiz/scoring.ts`) is pure, DB-free, and
fully unit-tested — it is the *only* source of career ranking. Gemini (`lib/ai/`) only explains an
already-computed ranking and is validated against a strict Zod schema before ever reaching the
client; a failed/unconfigured Gemini call always degrades to the deterministic-only view.

---

## Local setup

**Prerequisites:** Node 20+, a PostgreSQL 14+ database (local or Supabase).

```bash
git clone <this-repo>
cd knowhow-ph
npm install

cp .env.example .env.local
# edit .env.local — at minimum set DATABASE_URL / DIRECT_URL to a real Postgres instance

npx prisma migrate deploy   # or `npx prisma migrate dev` on first run to create the migration
npm run db:seed             # populates ~20 careers, schools, programs, and the quiz question bank

npm run dev
# → http://localhost:3000
```

The app runs fully **without** Supabase or Gemini configured: public browsing, search, the career
explorer, and the full quiz (deterministic results) all work. Signing in, saving careers, the admin
CMS, and AI-generated quiz explanations require the relevant env vars (see below).

**Local Postgres quickstart** (if you don't have Supabase yet):

```bash
createdb knowhow
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/knowhow"
# DIRECT_URL is the same value for a local (non-pooled) database
```

**Admin bootstrap:** set `ADMIN_EMAILS=you@example.com` in `.env.local`. The first time that email
signs in via Supabase Auth, `lib/auth/session.ts` auto-promotes it to the `ADMIN` role.

---

## Database: migrations & seed data

```bash
npm run prisma:generate   # regenerate the Prisma client after a schema change
npm run prisma:migrate    # create + apply a new migration in dev (prompts for a name)
npm run prisma:deploy     # apply existing migrations (CI/production)
npm run prisma:studio     # visual DB browser
npm run db:seed           # idempotent — safe to re-run; upserts by slug/unique key
```

Seed data lives in `prisma/seed.ts` + `prisma/seed-data/*.ts` and creates, across **9 industries /
14 categories**:

- **20 careers** (all `PUBLISHED`, `POC_SEED`) with full detail: skills, work-style tags, pathways,
  certifications, 5 metrics each (salary/demand/saturation/remote/freelance), source references,
  and a `CareerQuizProfile` (ideal trait vector + weights + hard constraints)
- **12 schools** and **22 programs** (clearly fictional/demo institutions — see
  [POC data & source labeling](#poc-data--source-labeling))
- **1 active quiz**, 6 sections, **35 questions**, ~160 options with trait-weighted answers
- **1 `DataSource`** record ("KnowHow POC Seed Data") that every seeded metric/reference cites

---

## Environment variables

See `.env.example` for the full annotated list. Summary:

| Variable | Required for | Notes |
|---|---|---|
| `DATABASE_URL`, `DIRECT_URL` | Everything | Postgres connection strings (pooled / direct) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth, saved careers, admin | App runs read-only/anonymous without these |
| `SUPABASE_SERVICE_ROLE_KEY` | Full account deletion | Server-only; omit and deletion just clears app data |
| `GEMINI_API_KEY` | AI quiz explanations | Server-only; omit and the app falls back to deterministic-only results |
| `GEMINI_MODEL` | — | Defaults to `gemini-2.0-flash` |
| `NEXT_PUBLIC_APP_URL` | SEO (sitemap/canonical URLs) | e.g. `https://knowhow.ph` in production |
| `POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | Analytics | Analytics is a no-op without these |
| `RATE_LIMIT_PROVIDER`, `RATE_LIMIT_REDIS_URL`, `RATE_LIMIT_REDIS_TOKEN` | Multi-instance rate limiting | Falls back to an in-memory limiter (fine for a single instance / MVP) |
| `ADMIN_EMAILS` | Admin bootstrap | Comma-separated emails auto-promoted to `ADMIN` on first sign-in |

**Never** expose `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY` with a `NEXT_PUBLIC_` prefix —
both are read only in server-only modules (`lib/ai/gemini.ts`, `lib/auth/supabase-admin.ts`).

---

## Running tests

```bash
npm run test          # Vitest: unit + integration (needs DATABASE_URL — integration tests create
                       # and clean up their own fixture rows, safe to run against a dev DB)
npm run test:watch
npm run test:e2e       # Playwright — auto-starts `next dev` on port 3100 and seeds nothing extra,
                       # so run `npm run db:seed` first for the fullest coverage
```

**Unit tests** (`tests/unit/`) cover the deterministic scoring engine in isolation — trait
normalization, weighted similarity, adjustments, hard-constraint exclusion vs. soft penalties,
deterministic reason generation — plus Zod validation of Gemini's output shape and rejection of
career IDs outside the supplied candidate set.

**Integration tests** (`tests/integration/`) cover career search/filtering, the full quiz
attempt → deterministic-result pipeline against a real Postgres database, the AI-insight fallback
path when `GEMINI_API_KEY` is unset (never throws, always records a `FAILED` `AiGeneration`), and
`requireAdmin`/`requireUser` auth guards.

**E2E tests** (`tests/e2e/`) use Playwright against a real running app: browsing/filtering careers,
viewing a career detail page (incl. correct 404 for an unknown slug), completing the full quiz and
reaching deterministic results, triggering the AI-insight panel (exercised against its fallback
path since no live Gemini key is used in tests), and confirming a signed-out visitor cannot reach
`/admin` or its API routes. `tests/e2e/save-career.spec.ts` (save-while-authenticated) is skipped
unless `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` + real Supabase env vars are set, since it needs a real
account — see the file for details. **No test calls the live Gemini API.**

---

## Gemini configuration & fallback behavior

`lib/ai/gemini.ts` is the only module that talks to Gemini, and it is `server-only`. It:

1. Runs **after** deterministic scoring is complete and only receives already-computed scores,
   reasons, and career facts — never raw quiz answers, emails, or user identifiers.
2. Sends a system instruction that pins the model to explaining (not re-ranking) the supplied
   results, forbids inventing data, and requires plain JSON output.
3. Validates the response against a strict Zod schema (`lib/ai/schema.ts`) and rejects any
   response referencing a `careerId` outside the supplied candidate set.
4. Retries transient failures (timeouts, 429/5xx) with bounded exponential backoff, under a hard
   20s timeout.
5. Records every attempt in `AiGeneration` (`PENDING → SUCCEEDED | FAILED`), including the model,
   latency, and error message, and **caches** a successful result per `QuizResult` so repeat views
   don't re-call the API.
6. Is rate-limited per caller (`app/api/quiz/results/[id]/ai-insight/route.ts`) — more generously
   for signed-in users than anonymous ones.

If `GEMINI_API_KEY` is unset, or any retry/validation attempt ultimately fails, the API returns a
`FAILED` generation and the results page renders a friendly fallback message — **the deterministic
top-5 matches, reasons, and breakdown are always shown regardless**, since generation is invoked
asynchronously from a dedicated button and never blocks the results page render.

---

## POC data & source labeling

Every career, school, and program in the seed data is marked `verificationStatus: POC_SEED` and
every quantitative metric (salary, demand, saturation, remote/freelance viability) cites the single
`DataSource` row titled **"KnowHow POC Seed Data"**, whose `methodologySummary` explicitly states
the values are illustrative placeholders, not sourced from a verified dataset. Schools/programs use
fictional institution names rather than real, current ones, to avoid implying real-world
availability. See `/about` in the running app, or `docs/METHODOLOGY.md`, for the full provenance
model and verification-status vocabulary (`POC_SEED`, `UNVERIFIED`, `NEEDS_REVIEW`, `VERIFIED`,
`ARCHIVED`) and how future real data should be reviewed in.

---

## Deployment (Vercel + Supabase)

1. **Supabase**: create a project, copy the Postgres connection strings into `DATABASE_URL`
   (pooled, port 6543) and `DIRECT_URL` (direct, port 5432), and the project URL/anon key into
   `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Copy the service role key into
   `SUPABASE_SERVICE_ROLE_KEY` (server-only — set it only in Vercel's environment variables, never
   commit it).
2. Run `npx prisma migrate deploy` against the Supabase database (from CI or locally pointed at
   prod), then `npm run db:seed` once to populate the POC catalog (safe to skip / re-run — it's
   idempotent).
3. **Vercel**: import the repo, set all variables from `.env.example` that apply (Supabase +
   optionally `GEMINI_API_KEY`/`GEMINI_MODEL` + `NEXT_PUBLIC_APP_URL` set to your production
   domain), and deploy. `next build` runs `prisma generate` automatically via `postinstall`.
4. Optionally connect PostHog (`POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`) and a Redis instance for
   `RATE_LIMIT_PROVIDER=upstash` if you need rate limiting to hold across multiple serverless
   instances (the default in-memory limiter is per-instance).

---

## Known MVP limitations

- **Salary/demand/saturation data is illustrative**, not live labor-market data — see above.
- **Search** uses application-level filtering/sorting over the full published catalog rather than a
  Postgres `tsvector`/GIN index pipeline; this is simple, fully testable, and adequate at the
  current (dozens-of-rows) POC scale, but should move to native full-text search before the catalog
  grows into the thousands.
- **Rate limiting** is in-memory by default (per server instance) — fine for a single-instance MVP,
  not for a multi-region serverless deployment without the optional Redis provider configured.
- **Admin quiz-question editing** is read-only in this pass (structure inspector + active-quiz
  toggle only); the question bank itself is managed via the seed/config layer. Trait *weights on
  careers* (the CareerQuizProfile) are fully editable in the admin UI.
- **E2E coverage for authenticated flows** (save-while-signed-in) is written but skipped by default
  since this environment has no live Supabase project; it runs given real credentials.
- **No company profiles, job-posting ingestion, or verified regional salary data yet** — the schema
  and provenance model are deliberately shaped so these can be added without reworking the core
  Career/Industry/Category/DataSource models (see Roadmap).
- **Single language (English)** — Filipino/Taglish content is a roadmap item, not yet implemented.

---

## Roadmap

- Company profiles + employee/company ratings
- Job-posting trend ingestion and verified, regionally-broken-down salary datasets
- School/provider verification workflow (self-serve claim + admin approval)
- Postgres full-text search (tsvector/GIN) once the catalog scales past the POC size
- Expert counselor review workflow layered on top of quiz results
- Personalized, trackable learning plans generated from a quiz result
- Recommendation feedback loop (did this match feel right?) feeding back into trait-profile tuning
- Filipino/Taglish localization
- Redis-backed rate limiting by default for multi-instance deployments
