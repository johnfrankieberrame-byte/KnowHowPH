import "server-only";
import { prisma } from "@/lib/db/prisma";
import { generateQuizInsight, AI_PROMPT_VERSION, type QuizCareerContext } from "@/lib/ai/gemini";
import { CALCULATION_VERSION } from "@/lib/quiz/scoring";
import { formatRating, formatSalaryRange, formatVerificationStatus } from "@/lib/utils/format";
import { notFound } from "@/lib/validations/api";

async function buildCareerContext(quizResultId: string): Promise<{
  topCareers: QuizCareerContext[];
  adjacentCandidateCareers: QuizCareerContext[];
  sectionScores: Record<string, number>;
}> {
  const result = await prisma.quizResult.findUnique({
    where: { id: quizResultId },
    include: {
      careers: {
        orderBy: { rank: "asc" },
        include: {
          career: {
            include: {
              primaryIndustry: true,
              primaryCategory: true,
              metrics: true,
            },
          },
        },
      },
    },
  });
  if (!result) throw notFound("Quiz result not found.");

  const toContext = (rc: (typeof result.careers)[number]): QuizCareerContext => {
    const salary = rc.career.metrics.find((m) => m.metricType === "SALARY");
    const demand = rc.career.metrics.find((m) => m.metricType === "DEMAND");
    return {
      careerId: rc.careerId,
      title: rc.career.title,
      industry: rc.career.primaryIndustry.name,
      category: rc.career.primaryCategory.name,
      verificationStatus: formatVerificationStatus(rc.career.verificationStatus),
      adjustedScore: rc.adjustedScore,
      matchReasons: rc.matchReasons,
      tradeOffs: rc.tradeOffs,
      salaryLabel: salary
        ? `${formatSalaryRange(salary.salaryMin, salary.salaryMax)} (${salary.status.replace("_", " ").toLowerCase()})`
        : "Not yet estimated",
      demandLabel: demand ? formatRating(demand.rating) : "Not yet rated",
    };
  };

  const sorted = result.careers;
  return {
    topCareers: sorted.slice(0, 3).map(toContext),
    adjacentCandidateCareers: sorted.slice(3, 5).map(toContext),
    sectionScores: result.sectionScores as Record<string, number>,
  };
}

/**
 * Returns a cached SUCCEEDED AiGeneration for this result if one exists at
 * the current calculation version, otherwise calls Gemini, persists the
 * outcome (success or failure) to AiGeneration, and returns it. Never
 * throws — a failure is recorded and returned with status FAILED so the
 * caller can render the deterministic-only view.
 */
export async function getOrCreateQuizInsight(quizResultId: string) {
  const cached = await prisma.aiGeneration.findFirst({
    where: { quizResultId, status: "SUCCEEDED", promptVersion: AI_PROMPT_VERSION },
    orderBy: { createdAt: "desc" },
  });
  if (cached) return cached;

  const context = await buildCareerContext(quizResultId);

  const generation = await prisma.aiGeneration.create({
    data: {
      quizResultId,
      status: "PENDING",
      promptVersion: AI_PROMPT_VERSION,
      requestPayloadSummary: {
        calculationVersion: CALCULATION_VERSION,
        topCareerIds: context.topCareers.map((c) => c.careerId),
        sectionScores: context.sectionScores,
      },
    },
  });

  const result = await generateQuizInsight(context);

  if (!result.success || !result.data) {
    return prisma.aiGeneration.update({
      where: { id: generation.id },
      data: {
        status: "FAILED",
        model: result.model,
        errorMessage: result.error?.slice(0, 1000),
        latencyMs: result.latencyMs,
      },
    });
  }

  return prisma.aiGeneration.update({
    where: { id: generation.id },
    data: {
      status: "SUCCEEDED",
      model: result.model,
      responseJson: result.data as unknown as object,
      latencyMs: result.latencyMs,
    },
  });
}
