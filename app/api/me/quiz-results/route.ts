import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { withApiErrorHandling } from "@/lib/validations/api";

export const GET = withApiErrorHandling(async () => {
  const user = await requireUser();
  const results = await prisma.quizResult.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { careers: { orderBy: { rank: "asc" }, take: 3, include: { career: true } } },
  });
  return NextResponse.json(results);
});
