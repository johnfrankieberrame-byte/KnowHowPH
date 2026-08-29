import { TRAIT_LABELS } from "@/lib/quiz/traits";
import type { CareerScoreResult } from "@/lib/quiz/scoring";

/**
 * Deterministic, template-based explanations derived directly from the score
 * breakdown — no AI involved. Gemini enrichment (lib/ai) may add color later,
 * but these reasons are always available and always accurate to the numbers.
 */
export function generateMatchReasons(result: CareerScoreResult): string[] {
  const reasons: string[] = [];

  for (const t of result.breakdown.topContributingTraits.slice(0, 3)) {
    if (t.similarity < 0.6) continue;
    reasons.push(`Your ${TRAIT_LABELS[t.trait].toLowerCase()} aligned strongly with this role.`);
  }

  const { adjustments } = result.breakdown;
  if (adjustments.remoteAlignment > 1.5) {
    reasons.push("Your work-location preference is compatible with this career's remote viability.");
  }
  if (adjustments.educationReadinessAlignment > 1) {
    reasons.push("Your readiness for further study or training matches what this path typically requires.");
  }
  if (adjustments.salaryExpectationAlignment > 1.5) {
    reasons.push("This career's typical earning range is in line with how much you prioritize income.");
  }

  if (reasons.length === 0) {
    reasons.push("This career scored well overall across your personality, skills, and work-style answers.");
  }

  return reasons.slice(0, 4);
}

export function generateTradeOffs(result: CareerScoreResult): string[] {
  const tradeOffs: string[] = [];

  for (const t of result.breakdown.lowestFitTraits) {
    if (t.similarity > 0.55) continue;
    tradeOffs.push(`This path may lean more on ${TRAIT_LABELS[t.trait].toLowerCase()} than you currently prefer.`);
  }

  const { adjustments, softPenalties } = result.breakdown;
  if (adjustments.educationReadinessAlignment < -1) {
    tradeOffs.push("This path may require more formal qualifications than you currently prefer.");
  }
  if (adjustments.certificationReadinessAlignment < -1) {
    tradeOffs.push("Entry usually requires certification or licensure, which needs extra preparation time.");
  }
  if (adjustments.remoteAlignment < -1.5) {
    tradeOffs.push("This career's remote-work viability may be lower than your stated preference.");
  }
  if (softPenalties > 0) {
    tradeOffs.push("One or more of your stated constraints add friction to entering this path.");
  }

  if (tradeOffs.length === 0) {
    tradeOffs.push("No major gaps stood out — treat this as a starting point for deeper research, not a guarantee.");
  }

  return tradeOffs.slice(0, 3);
}
