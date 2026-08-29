import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateQuizInsight } from "@/lib/ai/insight-service";
import { withApiErrorHandling, notFound, rateLimited } from "@/lib/validations/api";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/auth/session";

export const POST = withApiErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const result = await prisma.quizResult.findUnique({ where: { resultToken: id } });
    if (!result) throw notFound("Quiz result not found.");

    // Anonymous requests are rate-limited by IP; signed-in users by user id (more generous).
    const user = await getCurrentUser().catch(() => null);
    const limitKey = user ? `ai-insight:user:${user.id}` : `ai-insight:ip:${getClientKey(req)}`;
    const limit = rateLimit(limitKey, user ? 20 : 5, 60 * 60_000);
    if (!limit.success) throw rateLimited("Too many AI insight requests. Please try again in a bit.");

    const generation = await getOrCreateQuizInsight(result.id);
    return NextResponse.json(generation);
  }
);
