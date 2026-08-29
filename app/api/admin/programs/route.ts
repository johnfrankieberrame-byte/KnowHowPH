import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { withApiErrorHandling, conflict } from "@/lib/validations/api";
import { prisma } from "@/lib/db/prisma";
import { logAdminAction } from "@/lib/db/audit";
import { programInputSchema } from "@/lib/validations/admin";
import { getAllProgramsForAdmin } from "@/lib/db/queries/admin";

export const GET = withApiErrorHandling(async () => {
  await requireAdmin();
  const programs = await getAllProgramsForAdmin();
  return NextResponse.json(programs);
});

export const POST = withApiErrorHandling(async (req: Request) => {
  const admin = await requireAdmin();
  const body = programInputSchema.parse(await req.json());

  const existing = await prisma.program.findUnique({ where: { slug: body.slug } });
  if (existing) throw conflict(`A program with slug "${body.slug}" already exists.`);

  const program = await prisma.program.create({ data: body });
  await logAdminAction(admin.id, "create_program", "Program", program.id, { name: program.name, slug: program.slug });

  return NextResponse.json(program, { status: 201 });
});
