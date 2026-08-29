import { NextResponse } from "next/server";
import { getQuizResultByToken } from "@/lib/quiz/service";
import { withApiErrorHandling } from "@/lib/validations/api";

export const GET = withApiErrorHandling(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const result = await getQuizResultByToken(id);
  return NextResponse.json(result);
});
