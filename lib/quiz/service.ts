import "server-only";
import { prisma } from "@/lib/db/prisma";
import {
  CALCULATION_VERSION,
  CareerProfileInput,
  QuizOptionValue,
  UserAnswerInput,
  collectUserConstraints,
  computeUserSectionProfile,
  normalizeUserTraits,
  rankCareers,
} from "@/lib/quiz/scoring";
import { generateMatchReasons, generateTradeOffs } from "@/lib/quiz/reasons";
import { generateResultToken, QUIZ_RESULT_EXPIRY_DAYS } from "@/lib/quiz/tokens";
import { notFound } from "@/lib/validations/api";

export async function getActiveQuiz() {
  const quiz = await prisma.quiz.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: { questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } } },
      },
    },
  });
  if (!quiz) throw notFound("No active quiz is configured yet.");
  return quiz;
}

/** Computes deterministic results for a submitted attempt and persists them. */
export async function computeAndStoreQuizResult(attemptId: string) {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: { include: { question: true } },
    },
  });
  if (!attempt) throw notFound("Quiz attempt not found.");

  const questionIds = attempt.answers.map((a) => a.questionId);
  const options = await prisma.quizOption.findMany({
    where: { questionId: { in: questionIds } },
  });
  const optionsByQuestion = new Map<string, typeof options>();
  for (const opt of options) {
    const list = optionsByQuestion.get(opt.questionId) ?? [];
    list.push(opt);
    optionsByQuestion.set(opt.questionId, list);
  }

  const userAnswers: UserAnswerInput[] = attempt.answers.map((answer) => {
    const selectedValues = Array.isArray(answer.valueJson)
      ? (answer.valueJson as unknown[]).map(String)
      : [String(answer.valueJson)];
    const questionOptions = optionsByQuestion.get(answer.questionId) ?? [];
    const selectedOptionValues: QuizOptionValue[] = questionOptions
      .filter((o) => selectedValues.includes(o.value))
      .map((o) => o.traitWeights as unknown as QuizOptionValue);
    return { questionId: answer.questionId, selectedOptionValues };
  });

  const userTraits = normalizeUserTraits(userAnswers);
  const userConstraints = collectUserConstraints(userAnswers);
  const sectionScores = computeUserSectionProfile(userTraits);

  const careers = await prisma.career.findMany({
    where: { publicationStatus: "PUBLISHED", quizProfile: { isNot: null } },
    include: {
      quizProfile: true,
      certifications: true,
      metrics: { where: { metricType: "SALARY" } },
    },
  });

  const profiles: CareerProfileInput[] = careers
    .filter((c) => c.quizProfile)
    .map((c) => {
      const salaryMetric = c.metrics[0];
      const salaryMidpoint =
        salaryMetric?.salaryMin != null && salaryMetric?.salaryMax != null
          ? (salaryMetric.salaryMin + salaryMetric.salaryMax) / 2
          : null;
      return {
        careerId: c.id,
        careerTitle: c.title,
        idealTraits: c.quizProfile!.idealTraits as CareerProfileInput["idealTraits"],
        traitWeights: c.quizProfile!.traitWeights as CareerProfileInput["traitWeights"],
        hardConstraints: (c.quizProfile!.hardConstraints as CareerProfileInput["hardConstraints"]) ?? [],
        educationLevel: c.educationLevel,
        entryDifficulty: c.entryDifficulty,
        remoteViability: c.remoteViability,
        certificationRequired: c.educationLevel === "LICENSE_REQUIRED" || c.certifications.some((cc) => cc.isRequired),
        salaryMidpointPhp: salaryMidpoint,
      };
    });

  const ranked = rankCareers(userTraits, userConstraints, profiles, 5);

  const resultToken = generateResultToken();
  const expiresAt = new Date(Date.now() + QUIZ_RESULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const result = await prisma.quizResult.create({
    data: {
      attemptId: attempt.id,
      resultToken,
      userId: attempt.userId,
      traitScores: userTraits,
      sectionScores,
      calculationVersion: CALCULATION_VERSION,
      expiresAt,
      careers: {
        create: ranked.map((r, index) => ({
          careerId: r.careerId,
          rank: index + 1,
          rawScore: r.rawScore,
          adjustedScore: r.adjustedScore,
          scoreBreakdown: r.breakdown as unknown as object,
          matchReasons: generateMatchReasons(r),
          tradeOffs: generateTradeOffs(r),
        })),
      },
    },
    include: { careers: { include: { career: true }, orderBy: { rank: "asc" } } },
  });

  await prisma.quizAttempt.update({
    where: { id: attempt.id },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });

  return result;
}

export async function getQuizResultByToken(resultToken: string) {
  const result = await prisma.quizResult.findUnique({
    where: { resultToken },
    include: {
      careers: {
        orderBy: { rank: "asc" },
        include: { career: { include: { primaryIndustry: true, primaryCategory: true, metrics: true } } },
      },
      aiGenerations: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!result) throw notFound("Quiz result not found. It may have expired.");
  if (result.expiresAt && result.expiresAt < new Date()) {
    throw notFound("This quiz result has expired. Please retake the quiz.");
  }
  return result;
}
