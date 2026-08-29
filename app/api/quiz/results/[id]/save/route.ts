import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { withApiErrorHandling, notFound } from "@/lib/validations/api";

/** Attaches an anonymous quiz result to the signed-in user's account. */
export const POST = withApiErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await params;

    const result = await prisma.quizResult.findUnique({ where: { resultToken: id } });
    if (!result) throw notFound("Quiz result not found.");

    const updated = await prisma.quizResult.update({
      where: { id: result.id },
      data: { userId: user.id },
    });

    await prisma.quizAttempt.update({ where: { id: updated.attemptId }, data: { userId: user.id } }).catch(() => {});

    return NextResponse.json({ ok: true });
  }
);
