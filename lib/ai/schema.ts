import { z } from "zod";

export const aiQuizResultSchema = z.object({
  summary: z.string().min(80).max(700),
  strengths: z
    .array(
      z.object({
        title: z.string().max(80),
        explanation: z.string().max(300),
      })
    )
    .min(2)
    .max(5),
  topCareerInsights: z
    .array(
      z.object({
        careerId: z.string(),
        careerTitle: z.string(),
        whyItFits: z.array(z.string().max(220)).min(2).max(4),
        tradeOffs: z.array(z.string().max(220)).min(1).max(3),
        nextSteps: z
          .array(
            z.object({
              timeframe: z.enum(["30_days", "60_days", "90_days"]),
              action: z.string().max(260),
            })
          )
          .min(3)
          .max(5),
      })
    )
    .min(1)
    .max(3),
  adjacentPaths: z
    .array(
      z.object({
        careerId: z.string(),
        reason: z.string().max(240),
      })
    )
    .max(2),
  disclaimer: z.string().max(400),
});

export type AiQuizResult = z.infer<typeof aiQuizResultSchema>;

/**
 * Validates a raw Gemini JSON payload against the schema AND checks that
 * every careerId referenced actually belongs to the supplied candidate set.
 * Throws on any violation — callers should treat that as "generation failed"
 * and fall back to deterministic-only results.
 */
export function validateAiQuizResult(raw: unknown, allowedCareerIds: Set<string>): AiQuizResult {
  const parsed = aiQuizResultSchema.parse(raw);

  for (const insight of parsed.topCareerInsights) {
    if (!allowedCareerIds.has(insight.careerId)) {
      throw new Error(`AI response referenced an unknown careerId: ${insight.careerId}`);
    }
  }
  for (const adjacent of parsed.adjacentPaths) {
    if (!allowedCareerIds.has(adjacent.careerId)) {
      throw new Error(`AI response referenced an unknown careerId: ${adjacent.careerId}`);
    }
  }

  return parsed;
}
