import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling, notFound } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "@/lib/db/audit";
import { dataSourceUpdateSchema } from "@/lib/validations/admin";

export const PATCH = withApiErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = dataSourceUpdateSchema.parse(await req.json());

    const existing = await prisma.dataSource.findUnique({ where: { id } });
    if (!existing) throw notFound("Data source not found.");

    const source = await prisma.dataSource.update({
      where: { id },
      data: { ...body, url: body.url === "" ? null : body.url, archivedUrl: body.archivedUrl === "" ? null : body.archivedUrl },
    });
    await logAdminAction(admin.id, "update_source", "DataSource", id, body);

    return NextResponse.json(source);
  }
);

export const DELETE = withApiErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const admin = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.dataSource.findUnique({
      where: { id },
      include: { _count: { select: { careerMetrics: true, careerReferences: true, schoolPrograms: true } } },
    });
    if (!existing) throw notFound("Data source not found.");

    const inUse =
      existing._count.careerMetrics > 0 || existing._count.careerReferences > 0 || existing._count.schoolPrograms > 0;
    if (inUse) {
      // Referenced by metrics/citations elsewhere — mark archived rather than hard-delete.
      const archived = await prisma.dataSource.update({
        where: { id },
        data: { verificationStatus: "ARCHIVED" },
      });
      await logAdminAction(admin.id, "archive_source", "DataSource", id, { verificationStatus: "ARCHIVED" });
      return NextResponse.json(archived);
    }

    await prisma.dataSource.delete({ where: { id } });
    await logAdminAction(admin.id, "delete_source", "DataSource", id, null);

    return NextResponse.json({ ok: true });
  }
);
