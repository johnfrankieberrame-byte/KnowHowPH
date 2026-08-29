/**
 * Controlled trait-dimension taxonomy for the deterministic quiz matcher.
 * Every quiz option maps to one or more of these, each normalized 0-100.
 * Changing this list requires bumping CALCULATION_VERSION in scoring.ts.
 */
export const TRAIT_KEYS = [
  "analytical",
  "creative",
  "people_oriented",
  "structured",
  "independent",
  "collaborative",
  "hands_on",
  "detail_oriented",
  "leadership",
  "communication",
  "digital_fluency",
  "quantitative",
  "flexibility_preference",
  "remote_preference",
  "stability_preference",
  "income_priority",
  "education_readiness",
  "certification_readiness",
  "entrepreneurship",
  "risk_tolerance",
] as const;

export type TraitKey = (typeof TRAIT_KEYS)[number];

export const TRAIT_LABELS: Record<TraitKey, string> = {
  analytical: "Analytical problem-solving",
  creative: "Creativity and ideation",
  people_oriented: "People-facing interaction",
  structured: "Preference for structure and rules",
  independent: "Independent, self-directed work",
  collaborative: "Team collaboration",
  hands_on: "Hands-on, physical work",
  detail_oriented: "Detail orientation",
  leadership: "Leadership and initiative",
  communication: "Communication",
  digital_fluency: "Digital and tech fluency",
  quantitative: "Quantitative / numerical reasoning",
  flexibility_preference: "Preference for flexible schedules",
  remote_preference: "Preference for remote work",
  stability_preference: "Preference for stability and routine",
  income_priority: "Priority placed on income",
  education_readiness: "Readiness for further formal education",
  certification_readiness: "Readiness to pursue certification/licensure",
  entrepreneurship: "Entrepreneurial drive",
  risk_tolerance: "Comfort with uncertainty and career risk",
};

/** Every quiz section, in fixed presentation order, with its global scoring weight. */
export const QUIZ_SECTION_ORDER = [
  "PERSONALITY_MOTIVATION",
  "SKILLS_STRENGTHS",
  "WORK_STYLE_FLEXIBILITY",
  "SALARY_GOALS",
  "EDUCATION_READINESS",
  "RISK_AMBITION",
] as const;

export type QuizSectionKeyLiteral = (typeof QUIZ_SECTION_ORDER)[number];

export const SECTION_WEIGHTS: Record<QuizSectionKeyLiteral, number> = {
  PERSONALITY_MOTIVATION: 0.3,
  SKILLS_STRENGTHS: 0.25,
  WORK_STYLE_FLEXIBILITY: 0.15,
  SALARY_GOALS: 0.1,
  EDUCATION_READINESS: 0.1,
  RISK_AMBITION: 0.1,
};

export const SECTION_LABELS: Record<QuizSectionKeyLiteral, string> = {
  PERSONALITY_MOTIVATION: "Personality & motivation",
  SKILLS_STRENGTHS: "Skills & strengths",
  WORK_STYLE_FLEXIBILITY: "Work style & flexibility",
  SALARY_GOALS: "Salary & career goals",
  EDUCATION_READINESS: "Education & qualification readiness",
  RISK_AMBITION: "Risk, ambition & transition readiness",
};

/** Which section each trait is scored under when computing per-section career fit. */
export const TRAIT_SECTION_MAP: Record<TraitKey, QuizSectionKeyLiteral> = {
  analytical: "PERSONALITY_MOTIVATION",
  creative: "PERSONALITY_MOTIVATION",
  people_oriented: "PERSONALITY_MOTIVATION",
  structured: "PERSONALITY_MOTIVATION",
  independent: "PERSONALITY_MOTIVATION",
  collaborative: "PERSONALITY_MOTIVATION",
  leadership: "PERSONALITY_MOTIVATION",
  communication: "PERSONALITY_MOTIVATION",
  hands_on: "SKILLS_STRENGTHS",
  detail_oriented: "SKILLS_STRENGTHS",
  digital_fluency: "SKILLS_STRENGTHS",
  quantitative: "SKILLS_STRENGTHS",
  flexibility_preference: "WORK_STYLE_FLEXIBILITY",
  remote_preference: "WORK_STYLE_FLEXIBILITY",
  stability_preference: "WORK_STYLE_FLEXIBILITY",
  income_priority: "SALARY_GOALS",
  education_readiness: "EDUCATION_READINESS",
  certification_readiness: "EDUCATION_READINESS",
  entrepreneurship: "RISK_AMBITION",
  risk_tolerance: "RISK_AMBITION",
};

/**
 * Explicit, user-selected hard constraints. Unlike trait scores (which apply
 * soft weighted penalties), a constraint present on both the user's answers
 * and a career's `hardConstraints` excludes that career from results.
 */
export const CONSTRAINT_KEYS = [
  "remote_only",
  "no_licensure",
  "no_further_study",
] as const;

export type ConstraintKey = (typeof CONSTRAINT_KEYS)[number];

export const CONSTRAINT_LABELS: Record<ConstraintKey, string> = {
  remote_only: "Only interested in fully remote work",
  no_licensure: "Not willing to pursue licensure/certification",
  no_further_study: "Cannot commit to further formal education/training",
};

export function isTraitKey(value: string): value is TraitKey {
  return (TRAIT_KEYS as readonly string[]).includes(value);
}
