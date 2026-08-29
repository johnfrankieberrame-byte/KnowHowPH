import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createAttemptSchema } from "@/lib/validations/quiz";
import { resolveAttemptOwner } from "@/lib/quiz/attempt-auth";
import { withApiErrorHandling, rateLimited } from "@/lib/validations/api";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

export const POST = withApiErrorHandling(async (req: Request) => {
  const limit = rateLimit(`quiz-attempt:${getClientKey(req)}`, 20, 60_000);
  if (!limit.success) throw rateLimited();

  const { quizId } = createAttemptSchema.parse(await req.json());
  const owner = await resolveAttemptOwner();

  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId,
      userId: owner.userId,
      anonymousId: owner.anonymousId,
      status: "IN_PROGRESS",
    },
  });

  return NextResponse.json(attempt, { status: 201 });
});
