import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling, notFound } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "@/lib/db/audit";
import { careerReviewSchema } from "@/lib/validations/admin";

const DEFAULT_REVIEW_INTERVAL_MONTHS = 6;

function monthsFromNow(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d;
}

export const POST = withApiErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = careerReviewSchema.parse(await req.json());

    const existing = await prisma.career.findUnique({ where: { id } });
    if (!existing) throw notFound("Career not found.");

    const now = new Date();
    const nextReviewDueAt = body.nextReviewDueAt ?? monthsFromNow(DEFAULT_REVIEW_INTERVAL_MONTHS);

    const career = await prisma.career.update({
      where: { id },
      data: {
        verificationStatus: body.verificationStatus,
        lastReviewedAt: now,
        nextReviewDueAt,
      },
    });

    await logAdminAction(admin.id, "review_career", "Career", id, {
      oldVerificationStatus: existing.verificationStatus,
      newVerificationStatus: career.verificationStatus,
      lastReviewedAt: now,
      nextReviewDueAt,
      note: body.note,
    });

    return NextResponse.json(career);
  }
);
