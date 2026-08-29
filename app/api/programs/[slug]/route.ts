import { NextResponse } from "next/server";
import { getProgramBySlug } from "@/lib/db/queries/schools";
import { withApiErrorHandling, notFound } from "@/lib/validations/api";

export const GET = withApiErrorHandling(async (_req: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) throw notFound("Program not found.");
  return NextResponse.json(program);
});
