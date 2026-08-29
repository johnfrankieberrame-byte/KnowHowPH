import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling, notFound } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "@/lib/db/audit";
import { careerPublishSchema } from "@/lib/validations/admin";

export const POST = withApiErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = careerPublishSchema.parse(await req.json().catch(() => ({})));

    const existing = await prisma.career.findUnique({ where: { id } });
    if (!existing) throw notFound("Career not found.");

    const career = await prisma.career.update({
      where: { id },
      data: { publicationStatus: body.publicationStatus },
    });

    await logAdminAction(admin.id, "publish_career", "Career", id, {
      oldStatus: existing.publicationStatus,
      newStatus: career.publicationStatus,
    });

    return NextResponse.json(career);
  }
);
