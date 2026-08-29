import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { withApiErrorHandling } from "@/lib/validations/api";

export const DELETE = withApiErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ careerId: string }> }) => {
    const user = await requireUser();
    const { careerId } = await params;
    await prisma.savedCareer.deleteMany({ where: { userId: user.id, careerId } });
    return NextResponse.json({ ok: true });
  }
);
