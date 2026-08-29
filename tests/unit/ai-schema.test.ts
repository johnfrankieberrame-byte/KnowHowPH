import { describe, expect, it } from "vitest";
import { validateAiQuizResult, aiQuizResultSchema } from "@/lib/ai/schema";

function validPayload(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    summary: "A".repeat(120),
    strengths: [
      { title: "Analytical thinking", explanation: "You consistently favored structured, data-driven reasoning in your answers." },
      { title: "Independent work style", explanation: "You indicated a strong preference for working with autonomy." },
    ],
    topCareerInsights: [
      {
        careerId: "career-1",
        careerTitle: "Data Analyst",
        whyItFits: ["Strong analytical alignment.", "High digital fluency match."],
        tradeOffs: ["May require more statistics background than you currently have."],
        nextSteps: [
          { timeframe: "30_days", action: "Take an intro spreadsheet/SQL course." },
          { timeframe: "60_days", action: "Build a small portfolio project analyzing public data." },
          { timeframe: "90_days", action: "Apply to entry-level data analyst roles or internships." },
        ],
      },
    ],
    adjacentPaths: [{ careerId: "career-2", reason: "Shares strong analytical and digital-fluency overlap." }],
    disclaimer: "This is an informational, non-guaranteed explanation of your deterministic quiz results.",
    ...overrides,
  };
}

describe("aiQuizResultSchema", () => {
  it("accepts a well-formed payload", () => {
    expect(() => aiQuizResultSchema.parse(validPayload())).not.toThrow();
  });

  it("rejects a summary that is too short", () => {
    expect(() => aiQuizResultSchema.parse(validPayload({ summary: "Too short." }))).toThrow();
  });

  it("rejects fewer than 2 strengths", () => {
    expect(() =>
      aiQuizResultSchema.parse(validPayload({ strengths: [{ title: "Only one", explanation: "Not enough entries here." }] }))
    ).toThrow();
  });

  it("rejects more than 3 topCareerInsights", () => {
    const base = validPayload();
    const four = [0, 1, 2, 3].map((i) => ({ ...base.topCareerInsights[0], careerId: `career-${i}` }));
    expect(() => aiQuizResultSchema.parse(validPayload({ topCareerInsights: four }))).toThrow();
  });

  it("rejects an invalid nextSteps timeframe", () => {
    const base = validPayload();
    const bad = {
      ...base,
      topCareerInsights: [
        {
          ...base.topCareerInsights[0],
          nextSteps: [{ timeframe: "6_months", action: "Invalid timeframe." }],
        },
      ],
    };
    expect(() => aiQuizResultSchema.parse(bad)).toThrow();
  });
});

describe("validateAiQuizResult", () => {
  it("passes through a valid payload whose careerIds are all allowed", () => {
    const allowed = new Set(["career-1", "career-2"]);
    const result = validateAiQuizResult(validPayload(), allowed);
    expect(result.topCareerInsights[0].careerId).toBe("career-1");
  });

  it("throws when a topCareerInsights careerId is not in the allowed candidate set", () => {
    const allowed = new Set(["career-2"]); // career-1 is NOT allowed
    expect(() => validateAiQuizResult(validPayload(), allowed)).toThrow(/unknown careerId/i);
  });

  it("throws when an adjacentPaths careerId is not in the allowed candidate set", () => {
    const allowed = new Set(["career-1"]); // career-2 (adjacent) is NOT allowed
    expect(() => validateAiQuizResult(validPayload(), allowed)).toThrow(/unknown careerId/i);
  });

  it("throws on malformed JSON shape rather than silently coercing it", () => {
    const allowed = new Set(["career-1", "career-2"]);
    expect(() => validateAiQuizResult({ not: "the right shape" }, allowed)).toThrow();
  });
});
