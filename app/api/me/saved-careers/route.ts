import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { withApiErrorHandling } from "@/lib/validations/api";

export const GET = withApiErrorHandling(async () => {
  const user = await requireUser();
  const saved = await prisma.savedCareer.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { career: { include: { primaryIndustry: true, primaryCategory: true, metrics: true } } },
  });
  return NextResponse.json(saved);
});
