import { NextResponse } from "next/server";
import { getCareerBySlug } from "@/lib/db/queries/careers";
import { withApiErrorHandling, notFound } from "@/lib/validations/api";

export const GET = withApiErrorHandling(async (_req: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const career = await getCareerBySlug(slug);
  if (!career) throw notFound("Career not found.");
  return NextResponse.json(career);
});
