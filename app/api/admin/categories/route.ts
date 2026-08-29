import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling, conflict, notFound } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "@/lib/db/audit";
import { categoryInputSchema } from "@/lib/validations/admin";
import { getAllCategoriesForAdmin } from "@/lib/db/queries/admin";

export const GET = withApiErrorHandling(async () => {
  await requireAdmin();
  const categories = await getAllCategoriesForAdmin();
  return NextResponse.json(categories);
});

export const POST = withApiErrorHandling(async (req: Request) => {
  const admin = await requireAdmin();
  const body = categoryInputSchema.parse(await req.json());

  const industry = await prisma.industry.findUnique({ where: { id: body.industryId } });
  if (!industry) throw notFound("Industry not found.");

  const existing = await prisma.careerCategory.findUnique({ where: { slug: body.slug } });
  if (existing) throw conflict(`A category with slug "${body.slug}" already exists.`);

  const category = await prisma.careerCategory.create({ data: body });
  await logAdminAction(admin.id, "create_category", "CareerCategory", category.id, body);

  return NextResponse.json(category, { status: 201 });
});
