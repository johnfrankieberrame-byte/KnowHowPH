import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling, notFound } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "@/lib/db/audit";
import { careerMetricUpdateSchema } from "@/lib/validations/admin";

export const PATCH = withApiErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string; metricId: string }> }) => {
    const admin = await requireAdmin();
    const { id: careerId, metricId } = await params;
    const body = careerMetricUpdateSchema.parse(await req.json());

    const existing = await prisma.careerMetric.findUnique({ where: { id: metricId } });
    if (!existing || existing.careerId !== careerId) throw notFound("Metric not found.");

    if (body.sourceId) {
      const source = await prisma.dataSource.findUnique({ where: { id: body.sourceId } });
      if (!source) throw notFound("Data source not found.");
    }

    const metric = await prisma.careerMetric.update({ where: { id: metricId }, data: body });
    await logAdminAction(admin.id, "update_metric", "CareerMetric", metricId, body);

    return NextResponse.json(metric);
  }
);

export const DELETE = withApiErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string; metricId: string }> }) => {
    const admin = await requireAdmin();
    const { id: careerId, metricId } = await params;

    const existing = await prisma.careerMetric.findUnique({ where: { id: metricId } });
    if (!existing || existing.careerId !== careerId) throw notFound("Metric not found.");

    await prisma.careerMetric.delete({ where: { id: metricId } });
    await logAdminAction(admin.id, "delete_metric", "CareerMetric", metricId, null);

    return NextResponse.json({ ok: true });
  }
);
