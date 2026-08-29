import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling, notFound, conflict } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "@/lib/db/audit";
import { programUpdateSchema } from "@/lib/validations/admin";

export const PATCH = withApiErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = programUpdateSchema.parse(await req.json());

    const existing = await prisma.program.findUnique({ where: { id } });
    if (!existing) throw notFound("Program not found.");

    if (body.slug && body.slug !== existing.slug) {
      const slugTaken = await prisma.program.findUnique({ where: { slug: body.slug } });
      if (slugTaken) throw conflict(`A program with slug "${body.slug}" already exists.`);
    }

    const program = await prisma.program.update({ where: { id }, data: body });
    await logAdminAction(admin.id, "update_program", "Program", id, body);

    return NextResponse.json(program);
  }
);

export const DELETE = withApiErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const admin = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.program.findUnique({
      where: { id },
      include: { _count: { select: { schoolPrograms: true, programCareers: true } } },
    });
    if (!existing) throw notFound("Program not found.");

    if (existing._count.schoolPrograms > 0 || existing._count.programCareers > 0) {
      const archived = await prisma.program.update({ where: { id }, data: { publicationStatus: "ARCHIVED" } });
      await logAdminAction(admin.id, "archive_program", "Program", id, { publicationStatus: "ARCHIVED" });
      return NextResponse.json(archived);
    }

    await prisma.program.delete({ where: { id } });
    await logAdminAction(admin.id, "delete_program", "Program", id, null);

    return NextResponse.json({ ok: true });
  }
);
