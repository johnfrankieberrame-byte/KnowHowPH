import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling, notFound, conflict } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "@/lib/db/audit";
import { schoolUpdateSchema } from "@/lib/validations/admin";

export const PATCH = withApiErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = schoolUpdateSchema.parse(await req.json());

    const existing = await prisma.school.findUnique({ where: { id } });
    if (!existing) throw notFound("School not found.");

    if (body.slug && body.slug !== existing.slug) {
      const slugTaken = await prisma.school.findUnique({ where: { slug: body.slug } });
      if (slugTaken) throw conflict(`A school with slug "${body.slug}" already exists.`);
    }

    const school = await prisma.school.update({
      where: { id },
      data: { ...body, website: body.website === "" ? null : body.website },
    });
    await logAdminAction(admin.id, "update_school", "School", id, body);

    return NextResponse.json(school);
  }
);

export const DELETE = withApiErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const admin = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.school.findUnique({
      where: { id },
      include: { _count: { select: { schoolPrograms: true } } },
    });
    if (!existing) throw notFound("School not found.");

    if (existing._count.schoolPrograms > 0) {
      const archived = await prisma.school.update({ where: { id }, data: { publicationStatus: "ARCHIVED" } });
      await logAdminAction(admin.id, "archive_school", "School", id, { publicationStatus: "ARCHIVED" });
      return NextResponse.json(archived);
    }

    await prisma.school.delete({ where: { id } });
    await logAdminAction(admin.id, "delete_school", "School", id, null);

    return NextResponse.json({ ok: true });
  }
);
