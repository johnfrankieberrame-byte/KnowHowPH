import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling, conflict } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "@/lib/db/audit";
import { schoolInputSchema } from "@/lib/validations/admin";
import { getAllSchoolsForAdmin } from "@/lib/db/queries/admin";

export const GET = withApiErrorHandling(async () => {
  await requireAdmin();
  const schools = await getAllSchoolsForAdmin();
  return NextResponse.json(schools);
});

export const POST = withApiErrorHandling(async (req: Request) => {
  const admin = await requireAdmin();
  const body = schoolInputSchema.parse(await req.json());

  const existing = await prisma.school.findUnique({ where: { slug: body.slug } });
  if (existing) throw conflict(`A school with slug "${body.slug}" already exists.`);

  const school = await prisma.school.create({ data: { ...body, website: body.website || null } });
  await logAdminAction(admin.id, "create_school", "School", school.id, { name: school.name, slug: school.slug });

  return NextResponse.json(school, { status: 201 });
});
