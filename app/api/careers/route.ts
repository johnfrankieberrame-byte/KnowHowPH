import { NextResponse } from "next/server";
import { careerSearchQuerySchema } from "@/lib/validations/careers";
import { searchCareers } from "@/lib/search/careers";
import { withApiErrorHandling } from "@/lib/validations/api";

export const GET = withApiErrorHandling(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const query = careerSearchQuerySchema.parse(Object.fromEntries(searchParams.entries()));
  // Re-parse array-capable params correctly (URLSearchParams collapses repeats via Object.fromEntries).
  const multiKeys = [
    "industry",
    "category",
    "educationLevel",
    "entryPathway",
    "demand",
    "saturation",
    "remote",
    "freelance",
    "workStyleTag",
    "skill",
    "entryDifficulty",
    "status",
  ] as const;
  const raw: Record<string, unknown> = { ...query };
  for (const key of multiKeys) {
    const values = searchParams.getAll(key);
    if (values.length) raw[key] = values;
  }
  const finalQuery = careerSearchQuerySchema.parse(raw);

  const result = await searchCareers(finalQuery);
  return NextResponse.json(result);
});
