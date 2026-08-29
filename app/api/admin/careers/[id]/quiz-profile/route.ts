import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling, notFound } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "@/lib/db/audit";
import { careerQuizProfileInputSchema } from "@/lib/validations/admin";
import type { Prisma } from "@prisma/client";

async function upsertQuizProfile(req: Request, careerId: string) {
  const admin = await requireAdmin();
  const body = careerQuizProfileInputSchema.parse(await req.json());

  const career = await prisma.career.findUnique({ where: { id: careerId } });
  if (!career) throw notFound("Career not found.");

  const data = {
    idealTraits: body.idealTraits as Prisma.InputJsonValue,
    traitWeights: body.traitWeights as Prisma.InputJsonValue,
    hardConstraints: body.hardConstraints as Prisma.InputJsonValue,
    calculationVersion: body.calculationVersion,
  };

  const profile = await prisma.careerQuizProfile.upsert({
    where: { careerId },
    create: {
      careerId,
      ...data,
      // Reserved for future acceptable-range scoring; no editor surface yet.
      acceptableRanges: {} as Prisma.InputJsonValue,
    },
    update: data,
  });

  await logAdminAction(admin.id, "update_quiz_profile", "CareerQuizProfile", profile.id, {
    careerId,
    hardConstraints: body.hardConstraints,
    calculationVersion: body.calculationVersion,
  });

  return NextResponse.json(profile);
}

export const PUT = withApiErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return upsertQuizProfile(req, id);
  }
);

export const PATCH = withApiErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return upsertQuizProfile(req, id);
  }
);
