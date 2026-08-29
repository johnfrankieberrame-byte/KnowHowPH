import { NextResponse } from "next/server";
import { getPublishedIndustries } from "@/lib/db/queries/industries";
import { withApiErrorHandling } from "@/lib/validations/api";

export const GET = withApiErrorHandling(async () => {
  const industries = await getPublishedIndustries();
  return NextResponse.json(industries);
});
