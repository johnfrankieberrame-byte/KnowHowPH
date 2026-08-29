import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling, notFound } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "@/lib/db/audit";
import { quizToggleActiveSchema } from "@/lib/validations/admin";

export const PATCH = withApiErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = quizToggleActiveSchema.parse(await req.json());

    const existing = await prisma.quiz.findUnique({ where: { id } });
    if (!existing) throw notFound("Quiz not found.");

    const quiz = await prisma.quiz.update({ where: { id }, data: { isActive: body.isActive } });
    await logAdminAction(admin.id, "update_quiz", "Quiz", id, {
      oldIsActive: existing.isActive,
      newIsActive: quiz.isActive,
    });

    return NextResponse.json(quiz);
  }
);
