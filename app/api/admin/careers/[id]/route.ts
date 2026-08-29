import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling, notFound, conflict } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "@/lib/db/audit";
import { careerUpdateSchema } from "@/lib/validations/admin";
import { getCareerBySlugForAdmin } from "@/lib/db/queries/careers";

export const GET = withApiErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    await requireAdmin();
    const { id } = await params;
    const career = await getCareerBySlugForAdmin(id);
    if (!career) throw notFound("Career not found.");
    return NextResponse.json(career);
  }
);

export const PATCH = withApiErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = careerUpdateSchema.parse(await req.json());

    const existing = await prisma.career.findUnique({ where: { id } });
    if (!existing) throw notFound("Career not found.");

    if (body.primaryIndustryId) {
      const industry = await prisma.industry.findUnique({ where: { id: body.primaryIndustryId } });
      if (!industry) throw notFound("Primary industry not found.");
    }
    if (body.primaryCategoryId) {
      const category = await prisma.careerCategory.findUnique({ where: { id: body.primaryCategoryId } });
      if (!category) throw notFound("Primary category not found.");
    }
    if (body.slug && body.slug !== existing.slug) {
      const slugTaken = await prisma.career.findUnique({ where: { slug: body.slug } });
      if (slugTaken) throw conflict(`A career with slug "${body.slug}" already exists.`);
    }

    const career = await prisma.career.update({ where: { id }, data: body });
    await logAdminAction(admin.id, "update_career", "Career", id, body);

    return NextResponse.json(career);
  }
);

export const DELETE = withApiErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const admin = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.career.findUnique({
      where: { id },
      include: { _count: { select: { savedBy: true, quizResultLinks: true } } },
    });
    if (!existing) throw notFound("Career not found.");

    if (existing._count.savedBy > 0 || existing._count.quizResultLinks > 0) {
      // Users have saved this career or it appears in stored quiz results —
      // archive instead of hard-deleting so we don't break their history.
      const archived = await prisma.career.update({
        where: { id },
        data: { publicationStatus: "ARCHIVED" },
      });
      await logAdminAction(admin.id, "archive_career", "Career", id, { publicationStatus: "ARCHIVED" });
      return NextResponse.json(archived);
    }

    await prisma.career.delete({ where: { id } });
    await logAdminAction(admin.id, "delete_career", "Career", id, null);

    return NextResponse.json({ ok: true });
  }
);
