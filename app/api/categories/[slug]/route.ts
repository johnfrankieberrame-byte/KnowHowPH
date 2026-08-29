import { NextResponse } from "next/server";
import { getCategoryBySlug } from "@/lib/db/queries/industries";
import { withApiErrorHandling, notFound } from "@/lib/validations/api";

export const GET = withApiErrorHandling(async (_req: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) throw notFound("Category not found.");
  return NextResponse.json(category);
});
