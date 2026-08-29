import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { CALCULATION_VERSION } from "@/lib/quiz/scoring";

const PREFIX = "test-aifallback-";

describe("AI insight fallback behavior (integration)", () => {
  let quizResultId: string;
  let attemptId: string;
  let careerId: string;

  beforeAll(async () => {
    const industry = await prisma.industry.create({
      data: { slug: `${PREFIX}industry`, name: "Test Industry", description: "d", publicationStatus: "PUBLISHED" },
    });
    const category = await prisma.careerCategory.create({
      data: { slug: `${PREFIX}category`, name: "Test Category", description: "d", industryId: industry.id, publicationStatus: "PUBLISHED" },
    });
    const career = await prisma.career.create({
      data: {
        slug: `${PREFIX}career`,
        title: "Fallback Fixture Career",
        shortDescription: "s",
        longDescription: "l",
        primaryIndustryId: industry.id,
        primaryCategoryId: category.id,
        responsibilities: ["Do things."],
        goodFitIf: ["fit"],
        challengingIf: ["challenge"],
        workEnvironment: "Office.",
        educationLevel: "BACHELORS",
        entryDifficulty: "MODERATE",
        timeToEntryMinMonths: 6,
        timeToEntryMaxMonths: 12,
        remoteViability: "HIGH",
        freelanceViability: "MODERATE",
        publicationStatus: "PUBLISHED",
        verificationStatus: "POC_SEED",
      },
    });
    careerId = career.id;

    const quiz = await prisma.quiz.create({
      data: { slug: `${PREFIX}quiz`, title: "t", description: "d", version: 1, isActive: false },
    });
    const attempt = await prisma.quizAttempt.create({
      data: { quizId: quiz.id, anonymousId: `${PREFIX}anon`, status: "SUBMITTED" },
    });
    attemptId = attempt.id;

    const result = await prisma.quizResult.create({
      data: {
        attemptId,
        resultToken: `${PREFIX}token-${Date.now()}`,
        traitScores: {},
        sectionScores: {},
        calculationVersion: CALCULATION_VERSION,
        careers: {
          create: [
            {
              careerId,
              rank: 1,
              rawScore: 80,
              adjustedScore: 82,
              scoreBreakdown: {},
              matchReasons: ["Strong analytical alignment."],
              tradeOffs: ["May need more formal training."],
            },
          ],
        },
      },
    });
    quizResultId = result.id;
  });

  afterAll(async () => {
    await prisma.aiGeneration.deleteMany({ where: { quizResultId } });
    await prisma.quizResultCareer.deleteMany({ where: { quizResultId } });
    await prisma.quizResult.deleteMany({ where: { id: quizResultId } });
    await prisma.quizAttempt.deleteMany({ where: { id: attemptId } });
    await prisma.quiz.deleteMany({ where: { slug: `${PREFIX}quiz` } });
    await prisma.career.deleteMany({ where: { id: careerId } });
    await prisma.careerCategory.deleteMany({ where: { slug: `${PREFIX}category` } });
    await prisma.industry.deleteMany({ where: { slug: `${PREFIX}industry` } });
  });

  it("records a FAILED AiGeneration and never throws when GEMINI_API_KEY is unset", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    try {
      const { getOrCreateQuizInsight } = await import("@/lib/ai/insight-service");
      const generation = await getOrCreateQuizInsight(quizResultId);
      expect(generation.status).toBe("FAILED");
      expect(generation.errorMessage).toMatch(/GEMINI_API_KEY/i);
    } finally {
      if (originalKey) process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it("returns a cached SUCCEEDED generation instead of calling Gemini again", async () => {
    await prisma.aiGeneration.create({
      data: {
        quizResultId,
        status: "SUCCEEDED",
        promptVersion: "quiz-insight-v1",
        model: "gemini-2.0-flash",
        responseJson: { summary: "cached", strengths: [], topCareerInsights: [], adjacentPaths: [], disclaimer: "d" },
      },
    });
    const { getOrCreateQuizInsight } = await import("@/lib/ai/insight-service");
    const spy = vi.spyOn(await import("@/lib/ai/gemini"), "generateQuizInsight");
    const generation = await getOrCreateQuizInsight(quizResultId);
    expect(generation.status).toBe("SUCCEEDED");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
