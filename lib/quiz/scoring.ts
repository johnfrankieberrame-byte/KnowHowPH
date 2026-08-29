import {
  CONSTRAINT_KEYS,
  ConstraintKey,
  QUIZ_SECTION_ORDER,
  QuizSectionKeyLiteral,
  SECTION_WEIGHTS,
  TRAIT_KEYS,
  TRAIT_SECTION_MAP,
  TraitKey,
  isTraitKey,
} from "@/lib/quiz/traits";

/**
 * Bump whenever trait taxonomy, section weights, or the adjustment formulas
 * change in a way that would make old QuizResult rows non-comparable to new
 * ones. Stored on every QuizResult / CareerQuizProfile for auditability.
 */
export const CALCULATION_VERSION = 1;

const NEUTRAL_SCORE = 50;

export type TraitScoreMap = Partial<Record<TraitKey, number>>;

/** The shape stored in QuizOption.traitWeights (JSON). */
export interface QuizOptionValue {
  traits: TraitScoreMap;
  constraints?: ConstraintKey[];
}

export interface UserAnswerInput {
  questionId: string;
  /** One entry per selected option (Likert/single-select = 1, multi-select = N). */
  selectedOptionValues: QuizOptionValue[];
}

export type EducationLevelLiteral =
  | "HIGH_SCHOOL"
  | "TESDA_CERTIFICATE"
  | "ASSOCIATE_OR_DIPLOMA"
  | "BACHELORS"
  | "POSTGRADUATE"
  | "LICENSE_REQUIRED"
  | "VARIES";

export type EntryDifficultyLiteral = "EASY" | "MODERATE" | "HARD" | "VERY_HARD";
export type RatingLevelLiteral = "VERY_LOW" | "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";

export interface CareerProfileInput {
  careerId: string;
  careerTitle: string;
  idealTraits: TraitScoreMap;
  traitWeights?: TraitScoreMap;
  hardConstraints?: ConstraintKey[];
  educationLevel: EducationLevelLiteral;
  entryDifficulty: EntryDifficultyLiteral;
  remoteViability: RatingLevelLiteral;
  certificationRequired?: boolean;
  salaryMidpointPhp?: number | null;
}

export interface AdjustmentBreakdown {
  remoteAlignment: number;
  educationReadinessAlignment: number;
  certificationReadinessAlignment: number;
  salaryExpectationAlignment: number;
  timeToEntryAlignment: number;
}

export interface ScoreBreakdown {
  sectionFits: Record<QuizSectionKeyLiteral, number>;
  rawScore: number;
  adjustments: AdjustmentBreakdown;
  softPenalties: number;
  adjustedScore: number;
  topContributingTraits: { trait: TraitKey; similarity: number; weight: number }[];
  lowestFitTraits: { trait: TraitKey; similarity: number; weight: number }[];
}

export interface CareerScoreResult {
  careerId: string;
  careerTitle: string;
  rawScore: number;
  adjustedScore: number;
  breakdown: ScoreBreakdown;
  excluded: boolean;
  excludedReason?: string;
}

// ---------------------------------------------------------------------------
// Step 1: normalize answers into a 0-100 trait vector
// ---------------------------------------------------------------------------

export function normalizeUserTraits(answers: UserAnswerInput[]): Record<TraitKey, number> {
  const sums: Partial<Record<TraitKey, number>> = {};
  const counts: Partial<Record<TraitKey, number>> = {};

  for (const answer of answers) {
    for (const optionValue of answer.selectedOptionValues) {
      for (const [trait, value] of Object.entries(optionValue.traits)) {
        if (!isTraitKey(trait) || typeof value !== "number") continue;
        sums[trait] = (sums[trait] ?? 0) + value;
        counts[trait] = (counts[trait] ?? 0) + 1;
      }
    }
  }

  const result = {} as Record<TraitKey, number>;
  for (const trait of TRAIT_KEYS) {
    const count = counts[trait];
    result[trait] = count ? Math.round((sums[trait]! / count) * 10) / 10 : NEUTRAL_SCORE;
  }
  return result;
}

export function collectUserConstraints(answers: UserAnswerInput[]): Set<ConstraintKey> {
  const constraints = new Set<ConstraintKey>();
  for (const answer of answers) {
    for (const optionValue of answer.selectedOptionValues) {
      for (const c of optionValue.constraints ?? []) {
        if ((CONSTRAINT_KEYS as readonly string[]).includes(c)) constraints.add(c);
      }
    }
  }
  return constraints;
}

/** Descriptive average of the user's own traits per section, for display only. */
export function computeUserSectionProfile(
  traits: Record<TraitKey, number>
): Record<QuizSectionKeyLiteral, number> {
  const buckets: Record<QuizSectionKeyLiteral, number[]> = {
    PERSONALITY_MOTIVATION: [],
    SKILLS_STRENGTHS: [],
    WORK_STYLE_FLEXIBILITY: [],
    SALARY_GOALS: [],
    EDUCATION_READINESS: [],
    RISK_AMBITION: [],
  };
  for (const trait of TRAIT_KEYS) {
    buckets[TRAIT_SECTION_MAP[trait]].push(traits[trait]);
  }
  const result = {} as Record<QuizSectionKeyLiteral, number>;
  for (const section of QUIZ_SECTION_ORDER) {
    const values = buckets[section];
    result[section] = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Step 2-6: score a single career against the user's trait vector
// ---------------------------------------------------------------------------

const EDUCATION_READINESS_REQUIREMENT: Record<EducationLevelLiteral, number> = {
  HIGH_SCHOOL: 20,
  TESDA_CERTIFICATE: 35,
  ASSOCIATE_OR_DIPLOMA: 50,
  BACHELORS: 65,
  POSTGRADUATE: 85,
  LICENSE_REQUIRED: 75,
  VARIES: 50,
};

const ENTRY_DIFFICULTY_RISK_REQUIREMENT: Record<EntryDifficultyLiteral, number> = {
  EASY: 20,
  MODERATE: 40,
  HARD: 60,
  VERY_HARD: 80,
};

const REMOTE_VIABILITY_SCORE: Record<RatingLevelLiteral, number> = {
  VERY_LOW: 10,
  LOW: 30,
  MODERATE: 50,
  HIGH: 75,
  VERY_HIGH: 95,
};

/** Illustrative POC salary bands (monthly, PHP) mapped to a 0-100 "earning potential" score. */
export function salaryMidpointToScore(midpoint: number | null | undefined): number {
  if (midpoint == null) return NEUTRAL_SCORE;
  if (midpoint < 15000) return 15;
  if (midpoint < 25000) return 35;
  if (midpoint < 40000) return 50;
  if (midpoint < 60000) return 65;
  if (midpoint < 100000) return 80;
  return 95;
}

function similarity(a: number, b: number): number {
  return 1 - Math.abs(a - b) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Weighted trait-alignment score (0-100) restricted to a set of traits. */
function weightedSimilarityForTraits(
  userTraits: Record<TraitKey, number>,
  idealTraits: TraitScoreMap,
  traitWeights: TraitScoreMap,
  traits: TraitKey[]
): number {
  let weightedSum = 0;
  let weightTotal = 0;
  for (const trait of traits) {
    const ideal = idealTraits[trait];
    if (ideal == null) continue;
    const weight = traitWeights[trait] ?? 1;
    weightedSum += similarity(userTraits[trait], ideal) * weight;
    weightTotal += weight;
  }
  if (weightTotal === 0) return NEUTRAL_SCORE;
  return Math.round(clamp((weightedSum / weightTotal) * 100, 0, 100) * 10) / 10;
}

function computeSectionFits(
  userTraits: Record<TraitKey, number>,
  profile: CareerProfileInput
): Record<QuizSectionKeyLiteral, number> {
  const traitWeights = profile.traitWeights ?? {};
  const result = {} as Record<QuizSectionKeyLiteral, number>;
  for (const section of QUIZ_SECTION_ORDER) {
    const traitsInSection = TRAIT_KEYS.filter((t) => TRAIT_SECTION_MAP[t] === section);
    result[section] = weightedSimilarityForTraits(userTraits, profile.idealTraits, traitWeights, traitsInSection);
  }
  return result;
}

function computeAdjustments(
  userTraits: Record<TraitKey, number>,
  profile: CareerProfileInput
): AdjustmentBreakdown {
  const remoteAlignment = clamp(
    (similarity(userTraits.remote_preference, REMOTE_VIABILITY_SCORE[profile.remoteViability]) - 0.5) * 12,
    -6,
    6
  );

  const requiredEducation = EDUCATION_READINESS_REQUIREMENT[profile.educationLevel];
  const educationDiff = userTraits.education_readiness - requiredEducation;
  const educationReadinessAlignment =
    educationDiff < 0 ? clamp(educationDiff / 5, -8, 0) : clamp(educationDiff / 12, 0, 4);

  let certificationReadinessAlignment = 0;
  if (profile.certificationRequired) {
    const diff = userTraits.certification_readiness - 55;
    certificationReadinessAlignment = diff < 0 ? clamp(diff / 6, -8, 0) : clamp(diff / 15, 0, 3);
  }

  const salaryScore = salaryMidpointToScore(profile.salaryMidpointPhp);
  const salaryExpectationAlignment = clamp(
    (similarity(userTraits.income_priority, salaryScore) - 0.5) * 10,
    -5,
    5
  );

  const requiredRisk = ENTRY_DIFFICULTY_RISK_REQUIREMENT[profile.entryDifficulty];
  const riskDiff = userTraits.risk_tolerance - requiredRisk;
  const timeToEntryAlignment = riskDiff < 0 ? clamp(riskDiff / 6, -6, 0) : clamp(riskDiff / 20, 0, 2);

  return {
    remoteAlignment: round1(remoteAlignment),
    educationReadinessAlignment: round1(educationReadinessAlignment),
    certificationReadinessAlignment: round1(certificationReadinessAlignment),
    salaryExpectationAlignment: round1(salaryExpectationAlignment),
    timeToEntryAlignment: round1(timeToEntryAlignment),
  };
}

function computeSoftPenalties(
  userTraits: Record<TraitKey, number>,
  userConstraints: Set<ConstraintKey>,
  profile: CareerProfileInput
): number {
  let penalty = 0;
  if (
    userConstraints.has("no_further_study") &&
    (profile.educationLevel === "BACHELORS" || profile.educationLevel === "POSTGRADUATE")
  ) {
    penalty += 12;
  }
  if (userConstraints.has("no_licensure") && profile.certificationRequired) {
    penalty += 8;
  }
  return round1(penalty);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function topTraitContributors(
  userTraits: Record<TraitKey, number>,
  profile: CareerProfileInput,
  direction: "highest" | "lowest",
  count: number
) {
  const traitWeights = profile.traitWeights ?? {};
  const entries = Object.entries(profile.idealTraits) as [TraitKey, number][];
  const scored = entries.map(([trait, ideal]) => ({
    trait,
    similarity: Math.round(similarity(userTraits[trait], ideal) * 1000) / 1000,
    weight: traitWeights[trait] ?? 1,
  }));
  scored.sort((a, b) =>
    direction === "highest"
      ? b.similarity * b.weight - a.similarity * a.weight
      : a.similarity * a.weight - b.similarity * b.weight
  );
  return scored.slice(0, count);
}

/**
 * Scores one career against a normalized user trait vector. Pure and
 * deterministic: identical inputs always produce identical output, so it is
 * fully unit-testable without a database.
 */
export function scoreCareer(
  userTraits: Record<TraitKey, number>,
  userConstraints: Set<ConstraintKey>,
  profile: CareerProfileInput
): CareerScoreResult {
  const violatedConstraint = (profile.hardConstraints ?? []).find((c) => userConstraints.has(c));
  if (violatedConstraint) {
    return {
      careerId: profile.careerId,
      careerTitle: profile.careerTitle,
      rawScore: 0,
      adjustedScore: 0,
      excluded: true,
      excludedReason: `Excluded because you indicated: "${violatedConstraint.replace(/_/g, " ")}".`,
      breakdown: {
        sectionFits: computeSectionFits(userTraits, profile),
        rawScore: 0,
        adjustments: {
          remoteAlignment: 0,
          educationReadinessAlignment: 0,
          certificationReadinessAlignment: 0,
          salaryExpectationAlignment: 0,
          timeToEntryAlignment: 0,
        },
        softPenalties: 0,
        adjustedScore: 0,
        topContributingTraits: [],
        lowestFitTraits: [],
      },
    };
  }

  const sectionFits = computeSectionFits(userTraits, profile);
  const rawScore = round1(
    QUIZ_SECTION_ORDER.reduce((sum, section) => sum + sectionFits[section] * SECTION_WEIGHTS[section], 0)
  );

  const adjustments = computeAdjustments(userTraits, profile);
  const adjustmentTotal = round1(Object.values(adjustments).reduce((a, b) => a + b, 0));
  const softPenalties = computeSoftPenalties(userTraits, userConstraints, profile);

  const adjustedScore = round1(clamp(rawScore + adjustmentTotal - softPenalties, 0, 100));

  return {
    careerId: profile.careerId,
    careerTitle: profile.careerTitle,
    rawScore,
    adjustedScore,
    excluded: false,
    breakdown: {
      sectionFits,
      rawScore,
      adjustments,
      softPenalties,
      adjustedScore,
      topContributingTraits: topTraitContributors(userTraits, profile, "highest", 4),
      lowestFitTraits: topTraitContributors(userTraits, profile, "lowest", 3),
    },
  };
}

/** Scores and ranks every candidate career, returning the top N (default 5) by adjusted score. */
export function rankCareers(
  userTraits: Record<TraitKey, number>,
  userConstraints: Set<ConstraintKey>,
  profiles: CareerProfileInput[],
  topN = 5
): CareerScoreResult[] {
  return profiles
    .map((profile) => scoreCareer(userTraits, userConstraints, profile))
    .filter((result) => !result.excluded)
    .sort((a, b) => b.adjustedScore - a.adjustedScore)
    .slice(0, topN);
}
