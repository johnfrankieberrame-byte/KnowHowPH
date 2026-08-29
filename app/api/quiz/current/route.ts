import { NextResponse } from "next/server";
import { getActiveQuiz } from "@/lib/quiz/service";
import { withApiErrorHandling } from "@/lib/validations/api";

export const GET = withApiErrorHandling(async () => {
  const quiz = await getActiveQuiz();
  return NextResponse.json(quiz);
});
