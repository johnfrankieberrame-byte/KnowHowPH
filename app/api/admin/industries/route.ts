import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling, conflict } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "@/lib/db/audit";
import { industryInputSchema } from "@/lib/validations/admin";
import { getAllIndustriesForAdmin } from "@/lib/db/queries/admin";

export const GET = withApiErrorHandling(async () => {
  await requireAdmin();
  const industries = await getAllIndustriesForAdmin();
  return NextResponse.json(industries);
});

export const POST = withApiErrorHandling(async (req: Request) => {
  const admin = await requireAdmin();
  const body = industryInputSchema.parse(await req.json());

  const existing = await prisma.industry.findUnique({ where: { slug: body.slug } });
  if (existing) throw conflict(`An industry with slug "${body.slug}" already exists.`);

  const industry = await prisma.industry.create({ data: body });
  await logAdminAction(admin.id, "create_industry", "Industry", industry.id, body);

  return NextResponse.json(industry, { status: 201 });
});
