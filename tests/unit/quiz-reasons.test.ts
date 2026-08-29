import { describe, expect, it } from "vitest";
import { generateMatchReasons, generateTradeOffs } from "@/lib/quiz/reasons";
import { normalizeUserTraits, scoreCareer, type CareerProfileInput } from "@/lib/quiz/scoring";

function profile(overrides: Partial<CareerProfileInput> = {}): CareerProfileInput {
  return {
    careerId: "c1",
    careerTitle: "Software Developer",
    idealTraits: { analytical: 85, digital_fluency: 90, independent: 65 },
    traitWeights: { analytical: 2, digital_fluency: 2, independent: 1 },
    hardConstraints: [],
    educationLevel: "BACHELORS",
    entryDifficulty: "MODERATE",
    remoteViability: "VERY_HIGH",
    certificationRequired: false,
    salaryMidpointPhp: 45000,
    ...overrides,
  };
}

describe("generateMatchReasons", () => {
  it("produces at least one reason for a well-aligned career", () => {
    const traits = normalizeUserTraits([
      { questionId: "q1", selectedOptionValues: [{ traits: { analytical: 88, digital_fluency: 92, remote_preference: 90 } }] },
    ]);
    const result = scoreCareer(traits, new Set(), profile());
    const reasons = generateMatchReasons(result);
    expect(reasons.length).toBeGreaterThan(0);
    expect(reasons.length).toBeLessThanOrEqual(4);
  });

  it("always returns a fallback reason even for a mediocre match", () => {
    const traits = normalizeUserTraits([]);
    const result = scoreCareer(traits, new Set(), profile());
    const reasons = generateMatchReasons(result);
    expect(reasons.length).toBeGreaterThan(0);
  });

  it("is deterministic for identical inputs", () => {
    const traits = normalizeUserTraits([
      { questionId: "q1", selectedOptionValues: [{ traits: { analytical: 70 } }] },
    ]);
    const result = scoreCareer(traits, new Set(), profile());
    expect(generateMatchReasons(result)).toEqual(generateMatchReasons(result));
  });
});

describe("generateTradeOffs", () => {
  it("flags an education-readiness gap for a postgraduate career", () => {
    const traits = normalizeUserTraits([
      { questionId: "q1", selectedOptionValues: [{ traits: { education_readiness: 5 } }] },
    ]);
    const result = scoreCareer(traits, new Set(), profile({ educationLevel: "POSTGRADUATE" }));
    const tradeOffs = generateTradeOffs(result);
    expect(tradeOffs.length).toBeGreaterThan(0);
  });

  it("always returns at least one trade-off statement, even for a strong match", () => {
    const traits = normalizeUserTraits([
      { questionId: "q1", selectedOptionValues: [{ traits: { analytical: 85, digital_fluency: 90, independent: 65 } }] },
    ]);
    const result = scoreCareer(traits, new Set(), profile());
    expect(generateTradeOffs(result).length).toBeGreaterThan(0);
  });
});
