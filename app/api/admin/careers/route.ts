import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling, conflict, notFound } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "@/lib/db/audit";
import { careerInputSchema } from "@/lib/validations/admin";
import { getAllCareersForAdmin } from "@/lib/db/queries/admin";
import { PublicationStatus, VerificationStatus } from "@prisma/client";

const listQuerySchema = z.object({
  publicationStatus: z.nativeEnum(PublicationStatus).optional(),
  verificationStatus: z.nativeEnum(VerificationStatus).optional(),
  industryId: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1).optional(),
});

export const GET = withApiErrorHandling(async (req: Request) => {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const filters = listQuerySchema.parse(Object.fromEntries(searchParams.entries()));
  const careers = await getAllCareersForAdmin(filters);
  return NextResponse.json(careers);
});

export const POST = withApiErrorHandling(async (req: Request) => {
  const admin = await requireAdmin();
  const body = careerInputSchema.parse(await req.json());

  const [industry, category] = await Promise.all([
    prisma.industry.findUnique({ where: { id: body.primaryIndustryId } }),
    prisma.careerCategory.findUnique({ where: { id: body.primaryCategoryId } }),
  ]);
  if (!industry) throw notFound("Primary industry not found.");
  if (!category) throw notFound("Primary category not found.");

  const existing = await prisma.career.findUnique({ where: { slug: body.slug } });
  if (existing) throw conflict(`A career with slug "${body.slug}" already exists.`);

  const career = await prisma.career.create({ data: body });
  await logAdminAction(admin.id, "create_career", "Career", career.id, {
    title: career.title,
    slug: career.slug,
  });

  return NextResponse.json(career, { status: 201 });
});
