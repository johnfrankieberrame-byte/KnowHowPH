# Methodology

This document explains how KnowHow scores career matches, how data provenance and verification
work, and the limitations of the current proof-of-concept (POC) dataset. It is the source of truth
that `/about` summarizes for end users.

## 1. The quiz is exploratory, not diagnostic

KnowHow's career quiz is a **career-exploration tool**. It is explicitly **not**:

- a psychological or personality assessment,
- a medical, clinical, or aptitude diagnosis,
- a hiring, recruitment, or employment-screening instrument.

Quiz answers are treated as personal preference data. They are never used for automated decisions
about a real person's employment, admission, or eligibility, and the product never claims to
"diagnose" the user. Every results page repeats this framing and includes explicit caveats.

## 2. Deterministic scoring is authoritative

All ranking is produced by `lib/quiz/scoring.ts` — a pure, side-effect-free module with no database
or network access, fully covered by unit tests (`tests/unit/quiz-scoring.test.ts`). Given identical
inputs it always produces identical output.

**Pipeline** (see `lib/quiz/service.ts` for the orchestration):

1. **Normalize answers → trait vector.** Every quiz option carries a `traitWeights` JSON payload
   shaped `{ traits: Partial<Record<TraitKey, 0-100>>, constraints?: ConstraintKey[] }`. Answers are
   averaged per trait across all selected options; a trait untouched by any answer defaults to a
   neutral 50. The 20-dimension `TraitKey` taxonomy (`lib/quiz/traits.ts`) spans personality
   (analytical, creative, people_oriented, structured, independent, collaborative, leadership,
   communication), skills (hands_on, detail_oriented, digital_fluency, quantitative), work style
   (flexibility_preference, remote_preference, stability_preference), goals (income_priority),
   readiness (education_readiness, certification_readiness), and ambition
   (entrepreneurship, risk_tolerance).
2. **Section fit per career.** For each of the 6 quiz sections (Personality & Motivation 30%,
   Skills & Strengths 25%, Work Style & Flexibility 15%, Salary & Goals 10%, Education Readiness
   10%, Risk/Ambition 10% — `SECTION_WEIGHTS`), we compute a weighted similarity between the user's
   trait vector and the career's `idealTraits`, restricted to the traits that section owns and
   weighted by the career's own `traitWeights` (a career can say "analytical matters twice as much
   to this role as independence"). A section with no career-defined ideal trait falls back to a
   neutral 50 rather than being silently dropped, so incomplete profiles are penalized honestly
   rather than inflated.
3. **Raw score** = the weighted sum of the 6 section fits.
4. **Transparent adjustments** (each individually visible in the stored breakdown): remote-work
   alignment, education-readiness alignment, certification/licensure-readiness alignment,
   salary-expectation alignment (against an illustrative salary-to-score banding — see §4), and
   entry-difficulty/time-to-entry alignment (via the user's risk tolerance).
5. **Soft penalties** apply for constraint mismatches that don't warrant outright exclusion (e.g.
   indicating you can't commit to further formal study against a bachelor's-level career).
6. **Hard constraints** are the one true exclusion mechanism, and only fire when the user
   *explicitly* selected a constraint (e.g. "I only want fully remote work") that a career's own
   profile lists as incompatible (e.g. Welder, Civil Engineer). Everything else is a penalty, never
   an exclusion — per the product requirement that only explicit user-selected constraints exclude.
7. **Final score** = `clamp(rawScore + adjustments − softPenalties, 0, 100)`.
8. The top 5 careers by final score are stored (`QuizResultCareer`), each with its raw score,
   adjusted score, full breakdown, and deterministically-generated match reasons / trade-offs
   (`lib/quiz/reasons.ts` — template-based, derived directly from the highest/lowest-contributing
   traits and the adjustment values, never from AI).
9. Every `QuizResult` stores a `calculationVersion` (`CALCULATION_VERSION` in `scoring.ts`). Bump it
   whenever the trait taxonomy, section weights, or adjustment formulas change in a way that makes
   old results non-comparable to new ones — old results remain readable, just tagged with their
   original version.

## 3. Gemini explains; it never ranks

`lib/ai/gemini.ts` is called only after step 9 above is complete and persisted. Its system prompt
states plainly: *"The provided career ranking and numeric scores are authoritative and must not be
changed or reordered... Never invent data, schools, salary figures, credentials, or labor-market
claims."* The response is validated against a strict Zod schema (`lib/ai/schema.ts`) that also
checks every referenced `careerId` belongs to the supplied candidate set — an invalid response is
discarded, not partially trusted. If Gemini is unavailable, misconfigured, or returns something
that fails validation after retries, the app falls back to the deterministic results with no
degradation to their accuracy or completeness.

## 4. Data provenance and verification statuses

Every fact that could plausibly be wrong or go stale is capable of citing a `DataSource` record
(title, publisher, canonical URL, source type, source/retrieved dates, methodology summary,
verification status, notes, optional archived-snapshot URL). `CareerMetric` rows (salary, demand,
saturation, remote/freelance viability) are versionable and independently sourced from career prose
so a metric can be updated without touching the career's description, and vice versa.

**`VerificationStatus` vocabulary** (applies to careers, schools, programs, and sources):

| Status | Meaning |
|---|---|
| `POC_SEED` | Illustrative placeholder created for this proof-of-concept. Not sourced from a verified dataset. |
| `UNVERIFIED` | Has a cited source, but not yet cross-checked by a human reviewer. |
| `NEEDS_REVIEW` | Flagged as potentially outdated, inconsistent, or disputed. |
| `VERIFIED` | Checked by a human reviewer against a cited, dated source. |
| `ARCHIVED` | Retired — kept for history, not shown as current. |

Illustrative salary/demand figures additionally carry a `SalaryDataStatus`
(`POC_ESTIMATE | VERIFIED | NEEDS_REVIEW`) shown directly on every career's "at a glance" card and
never silently upgraded — a figure only becomes `VERIFIED` when an admin attaches a real source and
sets the status explicitly via the review workflow (`POST /api/admin/careers/[id]/review`).

**Illustrative salary bands.** The scoring engine's salary-alignment adjustment
(`salaryMidpointToScore` in `lib/quiz/scoring.ts`) maps a career's seeded monthly PHP midpoint into
a coarse 0–100 "earning potential" score purely to compare against how much the user says they
prioritize income — it is an internal scoring signal, not a labor-market claim, and is never shown
to users as a fact.

## 5. POC seed data limitations

- All 20 seeded careers, 12 schools, and 22 programs are `POC_SEED`. Schools use invented,
  clearly-fictional institution names rather than real ones, specifically so the product never
  implies a real school currently offers a real program at a real price.
- The single `DataSource` row ("KnowHow POC Seed Data", type `INTERNAL_POC`) backing all seeded
  metrics and references states outright that its values are illustrative and require verification
  before being treated as fact.
- Search/filter relevance ranking (`lib/search/careers.ts`) is intentionally simple
  (application-level scoring over the full published set) — adequate at POC scale, not a substitute
  for a production full-text index once the catalog grows.

## 6. How future labor-market data should be verified and reviewed

1. **Prefer primary sources.** Government (PSA, DOLE, TESDA), accredited schools, and professional
   bodies outrank aggregated job-platform listings; `SourceType` records which kind backs a fact.
2. **Never silently overwrite POC data.** An admin replacing a `POC_SEED` metric should attach a
   real `DataSource` (with URL, publisher, retrieved date, and a methodology note describing how
   the figure was derived — e.g. sample size, region, date range) and only then move the
   `verificationStatus` to `VERIFIED`.
3. **Set a review cadence.** Every career carries `lastReviewedAt` / `nextReviewDueAt`; the admin
   review queue (`/admin/review-queue`, backed by `getReviewQueueItems`) surfaces anything overdue
   or still `POC_SEED`/`NEEDS_REVIEW` so nothing goes stale silently.
4. **Log the change.** Every admin mutation that touches a career, source, school, or program writes
   an `AdminAuditLog` row (`lib/db/audit.ts`) — who changed what, and when — so provenance changes
   themselves stay auditable.
5. **Keep geography and experience level explicit.** `CareerMetric.geography` defaults to
   "Philippines" and `experienceLevel`/`periodLabel` are free-text fields specifically so a future
   verified dataset can express regional and seniority variation without a schema change — see the
   Roadmap in `README.md` for the planned verified/regional salary dataset work.
