import { NextResponse } from "next/server";
import { schoolFilterQuerySchema } from "@/lib/validations/schools";
import { getPublishedSchools } from "@/lib/db/queries/schools";
import { withApiErrorHandling } from "@/lib/validations/api";

export const GET = withApiErrorHandling(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const raw: Record<string, unknown> = Object.fromEntries(searchParams.entries());
  for (const key of ["region", "type", "status"] as const) {
    const values = searchParams.getAll(key);
    if (values.length) raw[key] = values;
  }
  const query = schoolFilterQuerySchema.parse(raw);

  const schools = await getPublishedSchools(query);
  return NextResponse.json(
    schools.map((school) => ({
      ...school,
      programCount: school.schoolPrograms.length,
    }))
  );
});
