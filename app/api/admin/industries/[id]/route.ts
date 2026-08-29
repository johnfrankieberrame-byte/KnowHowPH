import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling, notFound, conflict } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "@/lib/db/audit";
import { industryInputSchema } from "@/lib/validations/admin";

export const PATCH = withApiErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = industryInputSchema.partial().parse(await req.json());

    const existing = await prisma.industry.findUnique({ where: { id } });
    if (!existing) throw notFound("Industry not found.");

    if (body.slug && body.slug !== existing.slug) {
      const slugTaken = await prisma.industry.findUnique({ where: { slug: body.slug } });
      if (slugTaken) throw conflict(`An industry with slug "${body.slug}" already exists.`);
    }

    const industry = await prisma.industry.update({ where: { id }, data: body });
    await logAdminAction(admin.id, "update_industry", "Industry", id, body);

    return NextResponse.json(industry);
  }
);

export const DELETE = withApiErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const admin = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.industry.findUnique({
      where: { id },
      include: { _count: { select: { categories: true, primaryCareers: true } } },
    });
    if (!existing) throw notFound("Industry not found.");

    if (existing._count.categories > 0 || existing._count.primaryCareers > 0) {
      // Has dependents — archive instead of hard-deleting to avoid orphaning careers/categories.
      const archived = await prisma.industry.update({
        where: { id },
        data: { publicationStatus: "ARCHIVED" },
      });
      await logAdminAction(admin.id, "archive_industry", "Industry", id, { publicationStatus: "ARCHIVED" });
      return NextResponse.json(archived);
    }

    await prisma.industry.delete({ where: { id } });
    await logAdminAction(admin.id, "delete_industry", "Industry", id, null);

    return NextResponse.json({ ok: true });
  }
);
