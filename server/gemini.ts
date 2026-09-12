import { GoogleGenAI } from "@google/genai";
import type { QuizAnswers, QuizResult } from "../src/types";
import { quizQuestions } from "../src/data/quizQuestions";

const SECTION_WEIGHTS: Record<string, number> = {
  "Personality & Motivation": 30,
  "Skills Assessment": 25,
  "Work Style & Remote Preference": 15,
  "Income & Career Goals": 10,
  "Education Readiness": 10,
  "Risk & Ambition": 10,
};

function buildPrompt(answers: QuizAnswers): string {
  const formattedAnswers = quizQuestions.map((q) => ({
    section: q.section,
    question: q.text,
    answer: answers[q.id] ?? null,
  }));

  return `Analyze these career quiz results for a user in the Philippines: ${JSON.stringify(formattedAnswers)}.

The sections were weighted as follows: Personality (${SECTION_WEIGHTS["Personality & Motivation"]}%), Skills (${SECTION_WEIGHTS["Skills Assessment"]}%), Work Style (${SECTION_WEIGHTS["Work Style & Remote Preference"]}%), Income (${SECTION_WEIGHTS["Income & Career Goals"]}%), Education (${SECTION_WEIGHTS["Education Readiness"]}%), Risk (${SECTION_WEIGHTS["Risk & Ambition"]}%).

Provide:
1. Top 3-5 career matches with compatibility %, reason, salary range (PHP), market demand, remote potential, and a short pathway.
2. A summary of their profile.
3. Education & pathway recommendations.
4. 3-5 specific skill development tips.
5. Philippine-specific market insights.

Return ONLY a JSON object following this schema:
{
  "matches": [
    {
      "career": "string",
      "compatibility": number,
      "reason": "string",
      "salaryRange": "string",
      "demand": "string",
      "remotePotential": "string",
      "pathway": "string"
    }
  ],
  "summary": "string",
  "educationRecommendation": "string",
  "skillTips": ["string"],
  "marketInsights": "string"
}`;
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return fenced ? fenced[1] : trimmed;
}

function validateResult(data: unknown): QuizResult {
  if (typeof data !== "object" || data === null) throw new Error("Gemini response was not a JSON object");
  const d = data as Record<string, unknown>;

  if (!Array.isArray(d.matches)) throw new Error("Gemini response missing matches[]");
  const matches = d.matches.map((m) => {
    const match = m as Record<string, unknown>;
    return {
      career: String(match.career ?? ""),
      compatibility: Number(match.compatibility ?? 0),
      reason: String(match.reason ?? ""),
      salaryRange: String(match.salaryRange ?? ""),
      demand: String(match.demand ?? ""),
      remotePotential: String(match.remotePotential ?? ""),
      pathway: String(match.pathway ?? ""),
    };
  });

  return {
    matches,
    summary: String(d.summary ?? ""),
    educationRecommendation: String(d.educationRecommendation ?? ""),
    skillTips: Array.isArray(d.skillTips) ? d.skillTips.map(String) : [],
    marketInsights: String(d.marketInsights ?? ""),
  };
}

export async function analyzeQuiz(answers: QuizAnswers): Promise<QuizResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const response = await ai.models.generateContent({
    model,
    contents: buildPrompt(answers),
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned an empty response.");

  const parsed = JSON.parse(extractJson(text));
  return validateResult(parsed);
}
