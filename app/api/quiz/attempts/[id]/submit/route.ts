import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resolveAttemptOwner, assertAttemptAccess } from "@/lib/quiz/attempt-auth";
import { computeAndStoreQuizResult } from "@/lib/quiz/service";
import { withApiErrorHandling, notFound, ApiError, rateLimited } from "@/lib/validations/api";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

export const POST = withApiErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const limit = rateLimit(`quiz-submit:${getClientKey(req)}`, 10, 60_000);
    if (!limit.success) throw rateLimited();

    const { id } = await params;
    const owner = await resolveAttemptOwner();

    const attempt = await prisma.quizAttempt.findUnique({ where: { id }, include: { answers: true } });
    if (!attempt) throw notFound("Quiz attempt not found.");
    assertAttemptAccess(attempt, owner);
    if (attempt.status !== "IN_PROGRESS") {
      throw new ApiError("CONFLICT", "This attempt has already been submitted.", 409);
    }
    if (attempt.answers.length === 0) {
      throw new ApiError("VALIDATION_ERROR", "Please answer at least one question before submitting.", 400);
    }

    const result = await computeAndStoreQuizResult(id);
    return NextResponse.json({ resultToken: result.resultToken });
  }
);
