import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";

/**
 * Full structural view of every quiz (sections -> questions -> options),
 * for the read-only admin inspector. Full question-bank CRUD is out of
 * MVP scope; questions are managed via the seed/config layer for now.
 */
export const GET = withApiErrorHandling(async () => {
  await requireAdmin();
  const quizzes = await prisma.quiz.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: { options: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });
  return NextResponse.json(quizzes);
});
