import { NextResponse } from "next/server";
import { programFilterQuerySchema } from "@/lib/validations/schools";
import { getPublishedPrograms } from "@/lib/db/queries/schools";
import { withApiErrorHandling } from "@/lib/validations/api";

export const GET = withApiErrorHandling(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const raw: Record<string, unknown> = Object.fromEntries(searchParams.entries());
  for (const key of ["credentialType", "deliveryMode", "status"] as const) {
    const values = searchParams.getAll(key);
    if (values.length) raw[key] = values;
  }
  const query = programFilterQuerySchema.parse(raw);

  const programs = await getPublishedPrograms(query);
  return NextResponse.json(
    programs.map((program) => ({
      ...program,
      schoolCount: program.schoolPrograms.length,
    }))
  );
});
