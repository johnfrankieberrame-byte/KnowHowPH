import { NextResponse } from "next/server";
import { getSchoolBySlug } from "@/lib/db/queries/schools";
import { withApiErrorHandling, notFound } from "@/lib/validations/api";

export const GET = withApiErrorHandling(async (_req: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const school = await getSchoolBySlug(slug);
  if (!school) throw notFound("School not found.");
  return NextResponse.json(school);
});
