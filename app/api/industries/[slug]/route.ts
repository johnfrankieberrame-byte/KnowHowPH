import { NextResponse } from "next/server";
import { getIndustryBySlug } from "@/lib/db/queries/industries";
import { withApiErrorHandling, notFound } from "@/lib/validations/api";

export const GET = withApiErrorHandling(async (_req: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) throw notFound("Industry not found.");
  return NextResponse.json(industry);
});
