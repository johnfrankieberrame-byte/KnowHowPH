import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { patchAttemptSchema } from "@/lib/validations/quiz";
import { resolveAttemptOwner, assertAttemptAccess } from "@/lib/quiz/attempt-auth";
import { withApiErrorHandling, notFound, ApiError } from "@/lib/validations/api";

export const PATCH = withApiErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = patchAttemptSchema.parse(await req.json());
    const owner = await resolveAttemptOwner();

    const attempt = await prisma.quizAttempt.findUnique({ where: { id } });
    if (!attempt) throw notFound("Quiz attempt not found.");
    assertAttemptAccess(attempt, owner);
    if (attempt.status !== "IN_PROGRESS") {
      throw new ApiError("CONFLICT", "This attempt has already been submitted.", 409);
    }

    if (body.answers?.length) {
      await prisma.$transaction(
        body.answers.map((a) =>
          prisma.quizAnswer.upsert({
            where: { attemptId_questionId: { attemptId: id, questionId: a.questionId } },
            update: { valueJson: a.value },
            create: { attemptId: id, questionId: a.questionId, valueJson: a.value },
          })
        )
      );
    }

    if (body.currentStep != null) {
      await prisma.quizAttempt.update({ where: { id }, data: { currentStep: body.currentStep } });
    }

    return NextResponse.json({ ok: true });
  }
);

export const GET = withApiErrorHandling(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const owner = await resolveAttemptOwner();
  const attempt = await prisma.quizAttempt.findUnique({ where: { id }, include: { answers: true } });
  if (!attempt) throw notFound("Quiz attempt not found.");
  assertAttemptAccess(attempt, owner);
  return NextResponse.json(attempt);
});
