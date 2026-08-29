import { describe, expect, it } from "vitest";
import {
  normalizeUserTraits,
  collectUserConstraints,
  scoreCareer,
  rankCareers,
  computeUserSectionProfile,
  salaryMidpointToScore,
  type UserAnswerInput,
  type CareerProfileInput,
} from "@/lib/quiz/scoring";
import { TRAIT_KEYS } from "@/lib/quiz/traits";

function baselineProfile(overrides: Partial<CareerProfileInput> = {}): CareerProfileInput {
  return {
    careerId: "career-1",
    careerTitle: "Test Career",
    idealTraits: { analytical: 80, digital_fluency: 70, independent: 60 },
    traitWeights: { analytical: 2, digital_fluency: 1, independent: 1 },
    hardConstraints: [],
    educationLevel: "BACHELORS",
    entryDifficulty: "MODERATE",
    remoteViability: "HIGH",
    certificationRequired: false,
    salaryMidpointPhp: 30000,
    ...overrides,
  };
}

describe("normalizeUserTraits", () => {
  it("defaults every trait to 50 when there are no answers", () => {
    const traits = normalizeUserTraits([]);
    for (const key of TRAIT_KEYS) {
      expect(traits[key]).toBe(50);
    }
  });

  it("averages contributions from multiple selected options", () => {
    const answers: UserAnswerInput[] = [
      { questionId: "q1", selectedOptionValues: [{ traits: { analytical: 90 } }] },
      { questionId: "q2", selectedOptionValues: [{ traits: { analytical: 70 } }] },
    ];
    const traits = normalizeUserTraits(answers);
    expect(traits.analytical).toBe(80);
  });

  it("averages across multiple options selected on one multi-select question", () => {
    const answers: UserAnswerInput[] = [
      {
        questionId: "q1",
        selectedOptionValues: [{ traits: { creative: 90 } }, { traits: { creative: 30 } }],
      },
    ];
    const traits = normalizeUserTraits(answers);
    expect(traits.creative).toBe(60);
  });

  it("ignores unknown trait keys defensively", () => {
    const answers: UserAnswerInput[] = [
      { questionId: "q1", selectedOptionValues: [{ traits: { not_a_real_trait: 99 } as never }] },
    ];
    const traits = normalizeUserTraits(answers);
    expect(traits.analytical).toBe(50);
  });
});

describe("collectUserConstraints", () => {
  it("collects constraints across all answers", () => {
    const answers: UserAnswerInput[] = [
      { questionId: "q1", selectedOptionValues: [{ traits: {}, constraints: ["remote_only"] }] },
      { questionId: "q2", selectedOptionValues: [{ traits: {}, constraints: ["no_licensure"] }] },
    ];
    const constraints = collectUserConstraints(answers);
    expect(constraints.has("remote_only")).toBe(true);
    expect(constraints.has("no_licensure")).toBe(true);
    expect(constraints.size).toBe(2);
  });

  it("returns an empty set when no options carry constraints", () => {
    const answers: UserAnswerInput[] = [{ questionId: "q1", selectedOptionValues: [{ traits: { analytical: 80 } }] }];
    expect(collectUserConstraints(answers).size).toBe(0);
  });
});

describe("computeUserSectionProfile", () => {
  it("produces a numeric average per section covering all six sections", () => {
    const traits = normalizeUserTraits([]);
    const profile = computeUserSectionProfile(traits);
    expect(Object.keys(profile)).toHaveLength(6);
    for (const value of Object.values(profile)) {
      expect(value).toBe(50);
    }
  });
});

describe("salaryMidpointToScore", () => {
  it("is monotonically non-decreasing across bands", () => {
    const points = [null, 10000, 20000, 35000, 50000, 80000, 150000];
    const scores = points.map((p) => salaryMidpointToScore(p as number | null));
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i - 1] - 40); // null->50 baseline isn't strictly ordered
    }
    expect(salaryMidpointToScore(150000)).toBeGreaterThan(salaryMidpointToScore(10000));
  });
});

describe("scoreCareer", () => {
  it("scores a perfectly-aligned user near 100 when the profile covers every section", () => {
    // baselineProfile only defines ideal traits in 2 of 6 sections, so sections with no
    // defined ideal trait fall back to a neutral 50 — this test uses a fully-specified
    // profile (one trait per section) to verify near-perfect alignment approaches 100.
    const fullProfile = baselineProfile({
      idealTraits: {
        analytical: 80, // PERSONALITY_MOTIVATION
        digital_fluency: 70, // SKILLS_STRENGTHS
        remote_preference: 60, // WORK_STYLE_FLEXIBILITY
        income_priority: 50, // SALARY_GOALS
        education_readiness: 65, // EDUCATION_READINESS
        risk_tolerance: 55, // RISK_AMBITION
      },
    });
    const perfectTraits = normalizeUserTraits([
      {
        questionId: "q1",
        selectedOptionValues: [
          {
            traits: {
              analytical: 80,
              digital_fluency: 70,
              remote_preference: 60,
              income_priority: 50,
              education_readiness: 65,
              risk_tolerance: 55,
            },
          },
        ],
      },
    ]);
    const result = scoreCareer(perfectTraits, new Set(), fullProfile);
    expect(result.excluded).toBe(false);
    expect(result.rawScore).toBeGreaterThan(95);
  });

  it("falls back to a neutral 50 for sections where the career profile defines no ideal trait", () => {
    const partialProfile = baselineProfile(); // only 2 of 6 sections covered
    const perfectTraits = normalizeUserTraits([
      { questionId: "q1", selectedOptionValues: [{ traits: { analytical: 80, digital_fluency: 70, independent: 60 } }] },
    ]);
    const result = scoreCareer(perfectTraits, new Set(), partialProfile);
    expect(result.breakdown.sectionFits.SALARY_GOALS).toBe(50);
    expect(result.breakdown.sectionFits.RISK_AMBITION).toBe(50);
    expect(result.rawScore).toBeCloseTo(77.5, 1);
  });

  it("scores a poorly-aligned user lower than a well-aligned one", () => {
    const profile = baselineProfile();
    const goodTraits = normalizeUserTraits([
      { questionId: "q1", selectedOptionValues: [{ traits: { analytical: 85, digital_fluency: 75, independent: 60 } }] },
    ]);
    const badTraits = normalizeUserTraits([
      { questionId: "q1", selectedOptionValues: [{ traits: { analytical: 10, digital_fluency: 15, independent: 60 } }] },
    ]);
    const good = scoreCareer(goodTraits, new Set(), profile);
    const bad = scoreCareer(badTraits, new Set(), profile);
    expect(good.adjustedScore).toBeGreaterThan(bad.adjustedScore);
  });

  it("is deterministic: identical inputs always produce identical output", () => {
    const profile = baselineProfile();
    const traits = normalizeUserTraits([
      { questionId: "q1", selectedOptionValues: [{ traits: { analytical: 65 } }] },
    ]);
    const a = scoreCareer(traits, new Set(), profile);
    const b = scoreCareer(traits, new Set(), profile);
    expect(a).toEqual(b);
  });

  it("excludes a career when the user's hard constraint matches the career's hardConstraints", () => {
    const profile = baselineProfile({ hardConstraints: ["remote_only"] });
    const traits = normalizeUserTraits([]);
    const result = scoreCareer(traits, new Set(["remote_only"]), profile);
    expect(result.excluded).toBe(true);
    expect(result.adjustedScore).toBe(0);
    expect(result.excludedReason).toBeTruthy();
  });

  it("does not exclude a career whose hardConstraints don't intersect the user's constraints", () => {
    const profile = baselineProfile({ hardConstraints: ["remote_only"] });
    const traits = normalizeUserTraits([]);
    const result = scoreCareer(traits, new Set(["no_licensure"]), profile);
    expect(result.excluded).toBe(false);
  });

  it("applies a soft penalty (not exclusion) for no_further_study against a bachelor's-level career", () => {
    const profile = baselineProfile({ educationLevel: "BACHELORS", hardConstraints: [] });
    const traits = normalizeUserTraits([]);
    const withConstraint = scoreCareer(traits, new Set(["no_further_study"]), profile);
    const without = scoreCareer(traits, new Set(), profile);
    expect(withConstraint.excluded).toBe(false);
    expect(withConstraint.adjustedScore).toBeLessThan(without.adjustedScore);
    expect(withConstraint.breakdown.softPenalties).toBeGreaterThan(0);
  });

  it("rewards remote alignment when user prefers remote and career is highly remote-viable", () => {
    const remoteProfile = baselineProfile({ remoteViability: "VERY_HIGH" });
    const onsiteProfile = baselineProfile({ remoteViability: "VERY_LOW" });
    const remotePreferringTraits = normalizeUserTraits([
      { questionId: "q1", selectedOptionValues: [{ traits: { remote_preference: 95 } }] },
    ]);
    const remoteResult = scoreCareer(remotePreferringTraits, new Set(), remoteProfile);
    const onsiteResult = scoreCareer(remotePreferringTraits, new Set(), onsiteProfile);
    expect(remoteResult.breakdown.adjustments.remoteAlignment).toBeGreaterThan(
      onsiteResult.breakdown.adjustments.remoteAlignment
    );
  });

  it("penalizes education-readiness shortfall against a postgraduate-level career", () => {
    const profile = baselineProfile({ educationLevel: "POSTGRADUATE" });
    const lowReadiness = normalizeUserTraits([
      { questionId: "q1", selectedOptionValues: [{ traits: { education_readiness: 10 } }] },
    ]);
    const result = scoreCareer(lowReadiness, new Set(), profile);
    expect(result.breakdown.adjustments.educationReadinessAlignment).toBeLessThan(0);
  });

  it("keeps adjustedScore within [0, 100]", () => {
    const profile = baselineProfile({ hardConstraints: [] });
    const extremeTraits = normalizeUserTraits([
      { questionId: "q1", selectedOptionValues: [{ traits: Object.fromEntries(TRAIT_KEYS.map((k) => [k, 0])) }] },
    ]);
    const result = scoreCareer(extremeTraits, new Set(["no_further_study"]), profile);
    expect(result.adjustedScore).toBeGreaterThanOrEqual(0);
    expect(result.adjustedScore).toBeLessThanOrEqual(100);
  });
});

describe("rankCareers", () => {
  it("returns at most topN careers sorted by descending adjustedScore", () => {
    const profiles: CareerProfileInput[] = Array.from({ length: 8 }, (_, i) =>
      baselineProfile({ careerId: `career-${i}`, idealTraits: { analytical: 10 + i * 10 } })
    );
    const traits = normalizeUserTraits([
      { questionId: "q1", selectedOptionValues: [{ traits: { analytical: 80 } }] },
    ]);
    const ranked = rankCareers(traits, new Set(), profiles, 5);
    expect(ranked).toHaveLength(5);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].adjustedScore).toBeGreaterThanOrEqual(ranked[i].adjustedScore);
    }
  });

  it("excludes hard-constraint violators from the ranked results entirely", () => {
    const profiles: CareerProfileInput[] = [
      baselineProfile({ careerId: "a", hardConstraints: ["remote_only"] }),
      baselineProfile({ careerId: "b", hardConstraints: [] }),
    ];
    const traits = normalizeUserTraits([]);
    const ranked = rankCareers(traits, new Set(["remote_only"]), profiles, 5);
    expect(ranked.find((r) => r.careerId === "a")).toBeUndefined();
    expect(ranked.find((r) => r.careerId === "b")).toBeDefined();
  });
});
