import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling, notFound } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "@/lib/db/audit";
import { careerMetricInputSchema } from "@/lib/validations/admin";

export const POST = withApiErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const admin = await requireAdmin();
    const { id: careerId } = await params;
    const body = careerMetricInputSchema.parse(await req.json());

    const career = await prisma.career.findUnique({ where: { id: careerId } });
    if (!career) throw notFound("Career not found.");

    if (body.sourceId) {
      const source = await prisma.dataSource.findUnique({ where: { id: body.sourceId } });
      if (!source) throw notFound("Data source not found.");
    }

    const metric = await prisma.careerMetric.create({ data: { ...body, careerId } });
    await logAdminAction(admin.id, "create_metric", "CareerMetric", metric.id, { careerId, ...body });

    return NextResponse.json(metric, { status: 201 });
  }
);
