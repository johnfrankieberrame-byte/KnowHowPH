import "server-only";
import { GoogleGenAI } from "@google/genai";
import { aiQuizResultSchema, validateAiQuizResult, type AiQuizResult } from "@/lib/ai/schema";

export const AI_PROMPT_VERSION = "quiz-insight-v1";

const SYSTEM_INSTRUCTION = `You are KnowHow's career-guidance explanation assistant for users in the Philippines.
Explain deterministic career-match results with clarity, humility, and practical next steps.
The provided career ranking and numeric scores are authoritative and must not be changed or reordered.
Use only supplied career facts and source-status labels. Never invent data, schools, salary figures,
credentials, or labor-market claims. Treat POC seed data as illustrative and label uncertainty naturally.
Do not make guarantees, diagnoses, hiring decisions, or claims of certainty. Do not provide legal, medical,
financial, or immigration advice. Do not make discriminatory inferences. Return only valid JSON matching
the requested schema — no markdown fences, no commentary outside the JSON object.`;

const RESPONSE_SCHEMA_DESCRIPTION = `{
  "summary": string (80-700 chars),
  "strengths": [{ "title": string (<=80 chars), "explanation": string (<=300 chars) }] (2-5 items),
  "topCareerInsights": [{
    "careerId": string (must be one of the supplied candidate career ids),
    "careerTitle": string,
    "whyItFits": string[] (2-4 items, each <=220 chars),
    "tradeOffs": string[] (1-3 items, each <=220 chars),
    "nextSteps": [{ "timeframe": "30_days" | "60_days" | "90_days", "action": string (<=260 chars) }] (3-5 items)
  }] (1-3 items, one per supplied top career, in the same order),
  "adjacentPaths": [{ "careerId": string (must be a supplied candidate id), "reason": string (<=240 chars) }] (0-2 items),
  "disclaimer": string (<=400 chars)
}`;

export interface QuizCareerContext {
  careerId: string;
  title: string;
  industry: string;
  category: string;
  verificationStatus: string;
  adjustedScore: number;
  matchReasons: string[];
  tradeOffs: string[];
  salaryLabel: string;
  demandLabel: string;
}

export interface QuizInsightInput {
  sectionScores: Record<string, number>;
  topCareers: QuizCareerContext[];
  adjacentCandidateCareers: QuizCareerContext[];
}

export interface GeminiCallResult {
  success: boolean;
  data?: AiQuizResult;
  rawText?: string;
  error?: string;
  latencyMs: number;
  model: string;
}

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

function buildPrompt(input: QuizInsightInput): string {
  const candidateIds = [...input.topCareers, ...input.adjacentCandidateCareers].map((c) => c.careerId);
  return [
    `Deterministic section scores (0-100, already computed — do not recalculate): ${JSON.stringify(
      input.sectionScores
    )}`,
    `Top matched careers (already ranked — explain, do not reorder): ${JSON.stringify(input.topCareers)}`,
    `Other candidate careers available for at most 2 "adjacent path" suggestions: ${JSON.stringify(
      input.adjacentCandidateCareers
    )}`,
    `Valid careerId values you may reference: ${JSON.stringify(candidateIds)}`,
    `Respond with a single JSON object matching exactly this shape: ${RESPONSE_SCHEMA_DESCRIPTION}`,
  ].join("\n\n");
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonText = fenced ? fenced[1] : trimmed;
  return JSON.parse(jsonText);
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Gemini request timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 500;
const TIMEOUT_MS = 20_000;

/**
 * Calls Gemini to explain deterministic quiz results and validates the
 * response against the strict output schema. Never throws — always resolves
 * with a success/failure result so callers can gracefully fall back to
 * deterministic-only results.
 */
export async function generateQuizInsight(input: QuizInsightInput): Promise<GeminiCallResult> {
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const start = Date.now();
  const client = getClient();

  if (!client) {
    return { success: false, error: "GEMINI_API_KEY is not configured.", latencyMs: 0, model };
  }

  const allowedCareerIds = new Set(
    [...input.topCareers, ...input.adjacentCandidateCareers].map((c) => c.careerId)
  );
  const prompt = buildPrompt(input);

  let lastError = "Unknown error";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await withTimeout(
        client.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            temperature: 0.4,
            maxOutputTokens: 2048,
          },
        }),
        TIMEOUT_MS
      );

      const text = response.text ?? "";
      if (!text) throw new Error("Empty response from Gemini.");

      const rawJson = extractJson(text);
      const data = validateAiQuizResult(rawJson, allowedCareerIds);

      return { success: true, data, rawText: text, latencyMs: Date.now() - start, model };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      const isLastAttempt = attempt === MAX_ATTEMPTS;
      const isRetryable = isTransientError(err);
      if (isLastAttempt || !isRetryable) break;
      await sleep(BASE_BACKOFF_MS * 2 ** (attempt - 1));
    }
  }

  return { success: false, error: lastError, latencyMs: Date.now() - start, model };
}

function isTransientError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /timeout|timed out|429|5\d\d|network|fetch failed|ECONNRESET/i.test(message);
}

export { aiQuizResultSchema };
