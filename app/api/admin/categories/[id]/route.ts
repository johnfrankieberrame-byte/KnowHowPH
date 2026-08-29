import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling, notFound, conflict } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "@/lib/db/audit";
import { categoryInputSchema } from "@/lib/validations/admin";

export const PATCH = withApiErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = categoryInputSchema.partial().parse(await req.json());

    const existing = await prisma.careerCategory.findUnique({ where: { id } });
    if (!existing) throw notFound("Category not found.");

    if (body.industryId) {
      const industry = await prisma.industry.findUnique({ where: { id: body.industryId } });
      if (!industry) throw notFound("Industry not found.");
    }

    if (body.slug && body.slug !== existing.slug) {
      const slugTaken = await prisma.careerCategory.findUnique({ where: { slug: body.slug } });
      if (slugTaken) throw conflict(`A category with slug "${body.slug}" already exists.`);
    }

    const category = await prisma.careerCategory.update({ where: { id }, data: body });
    await logAdminAction(admin.id, "update_category", "CareerCategory", id, body);

    return NextResponse.json(category);
  }
);

export const DELETE = withApiErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const admin = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.careerCategory.findUnique({
      where: { id },
      include: { _count: { select: { primaryCareers: true } } },
    });
    if (!existing) throw notFound("Category not found.");

    if (existing._count.primaryCareers > 0) {
      const archived = await prisma.careerCategory.update({
        where: { id },
        data: { publicationStatus: "ARCHIVED" },
      });
      await logAdminAction(admin.id, "archive_category", "CareerCategory", id, { publicationStatus: "ARCHIVED" });
      return NextResponse.json(archived);
    }

    await prisma.careerCategory.delete({ where: { id } });
    await logAdminAction(admin.id, "delete_category", "CareerCategory", id, null);

    return NextResponse.json({ ok: true });
  }
);
