import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { savedCareerSchema } from "@/lib/validations/careers";
import { withApiErrorHandling, conflict, notFound } from "@/lib/validations/api";

export const POST = withApiErrorHandling(async (req: Request) => {
  const user = await requireUser();
  const body = savedCareerSchema.parse(await req.json());

  const career = await prisma.career.findUnique({ where: { id: body.careerId } });
  if (!career) throw notFound("Career not found.");

  const existing = await prisma.savedCareer.findUnique({
    where: { userId_careerId: { userId: user.id, careerId: body.careerId } },
  });
  if (existing) throw conflict("Career is already saved.");

  const saved = await prisma.savedCareer.create({ data: { userId: user.id, careerId: body.careerId } });
  return NextResponse.json(saved, { status: 201 });
});
