import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/auth/supabase-admin";
import { withApiErrorHandling } from "@/lib/validations/api";

/** Deletes the current user's saved careers, quiz history, profile, and (if configured) their auth account. */
export const DELETE = withApiErrorHandling(async () => {
  const user = await requireUser();

  await prisma.$transaction([
    prisma.savedCareer.deleteMany({ where: { userId: user.id } }),
    prisma.quizAttempt.updateMany({ where: { userId: user.id }, data: { userId: null } }),
    prisma.quizResult.updateMany({ where: { userId: user.id }, data: { userId: null } }),
    prisma.profile.deleteMany({ where: { userId: user.id } }),
  ]);

  const admin = createSupabaseAdminClient();
  if (admin) {
    await admin.auth.admin.deleteUser(user.id).catch(() => {});
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
});
