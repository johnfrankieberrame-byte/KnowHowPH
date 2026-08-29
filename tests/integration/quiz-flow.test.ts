import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { computeAndStoreQuizResult, getQuizResultByToken } from "@/lib/quiz/service";
import { CALCULATION_VERSION } from "@/lib/quiz/scoring";

const PREFIX = "test-quizflow-";

describe("quiz attempt -> deterministic result (integration)", () => {
  let quizId: string;
  let questionId: string;
  let optionAnalyticalId: string;
  let careerId: string;
  let attemptId: string;

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
        title: "Test Fixture Career",
        shortDescription: "s",
        longDescription: "l",
        primaryIndustryId: industry.id,
        primaryCategoryId: category.id,
        responsibilities: ["Do things."],
        goodFitIf: ["You like this."],
        challengingIf: ["You dislike that."],
        workEnvironment: "Office.",
        educationLevel: "BACHELORS",
        entryDifficulty: "MODERATE",
        timeToEntryMinMonths: 6,
        timeToEntryMaxMonths: 12,
        remoteViability: "HIGH",
        freelanceViability: "MODERATE",
        publicationStatus: "PUBLISHED",
        verificationStatus: "POC_SEED",
        // Ideal traits are set to exactly match the user's answer (analytical: 95) plus the
        // neutral default (50) the scorer assigns to every unanswered trait — this guarantees
        // a rawScore at (or extremely near) the maximum of 100 regardless of how many other
        // careers exist in the shared test database (e.g. from a concurrently-running seed
        // script), so this fixture is virtually guaranteed to land in the top-5 results without
        // the test needing to isolate or truncate other tables.
        quizProfile: {
          create: {
            idealTraits: {
              analytical: 95,
              creative: 50,
              people_oriented: 50,
              digital_fluency: 50,
              flexibility_preference: 50,
              income_priority: 50,
              education_readiness: 50,
              risk_tolerance: 50,
            },
            acceptableRanges: {},
            traitWeights: { analytical: 3 },
            hardConstraints: [],
            calculationVersion: CALCULATION_VERSION,
          },
        },
      },
    });
    careerId = career.id;

    const quiz = await prisma.quiz.create({
      data: { slug: `${PREFIX}quiz`, title: "Test Quiz", description: "d", version: 1, isActive: false },
    });
    quizId = quiz.id;
    const section = await prisma.quizSection.create({
      data: { quizId, key: "PERSONALITY_MOTIVATION", title: "Personality", description: "d", weight: 0.3, order: 0 },
    });
    const question = await prisma.quizQuestion.create({
      data: { sectionId: section.id, type: "LIKERT_5", prompt: "I enjoy solving analytical problems.", order: 0, isRequired: true },
    });
    questionId = question.id;
    const option = await prisma.quizOption.create({
      data: { questionId, label: "Strongly agree", value: "5", order: 4, traitWeights: { traits: { analytical: 95 } } },
    });
    optionAnalyticalId = option.id;

    const attempt = await prisma.quizAttempt.create({
      data: { quizId, anonymousId: `${PREFIX}anon`, status: "IN_PROGRESS" },
    });
    attemptId = attempt.id;
    await prisma.quizAnswer.create({
      data: { attemptId, questionId, valueJson: "5" },
    });
  });

  afterAll(async () => {
    await prisma.quizResultCareer.deleteMany({ where: { careerId } });
    await prisma.aiGeneration.deleteMany({ where: { quizResult: { attempt: { anonymousId: `${PREFIX}anon` } } } });
    await prisma.quizResult.deleteMany({ where: { attempt: { anonymousId: `${PREFIX}anon` } } });
    await prisma.quizAnswer.deleteMany({ where: { attemptId } });
    await prisma.quizAttempt.deleteMany({ where: { anonymousId: `${PREFIX}anon` } });
    await prisma.quizOption.deleteMany({ where: { id: optionAnalyticalId } });
    await prisma.quizQuestion.deleteMany({ where: { id: questionId } });
    await prisma.quizSection.deleteMany({ where: { quizId } });
    await prisma.quiz.deleteMany({ where: { id: quizId } });
    await prisma.careerQuizProfile.deleteMany({ where: { careerId } });
    await prisma.career.deleteMany({ where: { id: careerId } });
    await prisma.careerCategory.deleteMany({ where: { slug: `${PREFIX}category` } });
    await prisma.industry.deleteMany({ where: { slug: `${PREFIX}industry` } });
  });

  it("computes and persists a deterministic result, then retrieves it by opaque token", async () => {
    const result = await computeAndStoreQuizResult(attemptId);
    expect(result.resultToken).toBeTruthy();
    expect(result.calculationVersion).toBe(CALCULATION_VERSION);
    expect(result.careers.length).toBeGreaterThan(0);

    const topCareer = result.careers.find((c) => c.careerId === careerId);
    expect(topCareer).toBeTruthy();
    expect(topCareer!.adjustedScore).toBeGreaterThan(0);
    expect(Array.isArray(topCareer!.matchReasons)).toBe(true);

    const fetched = await getQuizResultByToken(result.resultToken);
    expect(fetched.id).toBe(result.id);
    expect(fetched.careers.some((c) => c.career.title === "Test Fixture Career")).toBe(true);

    const updatedAttempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } });
    expect(updatedAttempt?.status).toBe("SUBMITTED");
  });

  it("rejects an unknown result token", async () => {
    await expect(getQuizResultByToken("not-a-real-token")).rejects.toThrow();
  });
});
