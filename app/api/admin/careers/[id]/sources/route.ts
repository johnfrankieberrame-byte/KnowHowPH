import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling, notFound } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "@/lib/db/audit";
import { careerSourceReferenceInputSchema } from "@/lib/validations/admin";

export const POST = withApiErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const admin = await requireAdmin();
    const { id: careerId } = await params;
    const body = careerSourceReferenceInputSchema.parse(await req.json());

    const [career, source] = await Promise.all([
      prisma.career.findUnique({ where: { id: careerId } }),
      prisma.dataSource.findUnique({ where: { id: body.sourceId } }),
    ]);
    if (!career) throw notFound("Career not found.");
    if (!source) throw notFound("Data source not found.");

    const reference = await prisma.careerSourceReference.create({ data: { ...body, careerId } });
    await logAdminAction(admin.id, "create_source_reference", "CareerSourceReference", reference.id, {
      careerId,
      ...body,
    });

    return NextResponse.json(reference, { status: 201 });
  }
);
