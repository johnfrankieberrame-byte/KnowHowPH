import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getActiveQuiz } from "@/lib/quiz/service";
import { resolveAttemptOwner } from "@/lib/quiz/attempt-auth";
import { QuizRunner } from "@/components/quiz/quiz-runner";

export const metadata: Metadata = { title: "Take the career quiz", robots: { index: false } };

export default async function QuizTakePage({
  searchParams,
}: {
  searchParams: Promise<{ attempt?: string }>;
}) {
  const { attempt: attemptId } = await searchParams;
  if (!attemptId) redirect("/quiz");

  const owner = await resolveAttemptOwner();
  const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } });

  if (!attempt) redirect("/quiz");
  const ownsAttempt =
    (attempt.userId && attempt.userId === owner.userId) ||
    (attempt.anonymousId && attempt.anonymousId === owner.anonymousId);
  if (!ownsAttempt) redirect("/quiz");

  if (attempt.status !== "IN_PROGRESS") {
    const result = await prisma.quizResult.findUnique({ where: { attemptId: attempt.id } });
    if (result) redirect(`/quiz/results/${result.resultToken}`);
    redirect("/quiz");
  }

  const quiz = await getActiveQuiz();

  return <QuizRunner quiz={quiz} attemptId={attempt.id} />;
}
