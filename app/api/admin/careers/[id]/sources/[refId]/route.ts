import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling, notFound } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "@/lib/db/audit";

export const DELETE = withApiErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string; refId: string }> }) => {
    const admin = await requireAdmin();
    const { id: careerId, refId } = await params;

    const existing = await prisma.careerSourceReference.findUnique({ where: { id: refId } });
    if (!existing || existing.careerId !== careerId) throw notFound("Source reference not found.");

    await prisma.careerSourceReference.delete({ where: { id: refId } });
    await logAdminAction(admin.id, "delete_source_reference", "CareerSourceReference", refId, null);

    return NextResponse.json({ ok: true });
  }
);
