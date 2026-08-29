import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, ListChecks } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Quiz history", robots: { index: false } };

export default async function QuizHistoryPage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/account");

  const results = await prisma.quizResult.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { careers: { orderBy: { rank: "asc" }, take: 3, include: { career: true } } },
  });

  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="text-3xl font-bold tracking-tight">Quiz history</h1>
      <p className="mt-1 text-muted-foreground">Past career quiz attempts saved to your account.</p>

      {results.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-lg border border-dashed border-border py-16 text-center">
          <ListChecks className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">You haven't saved any quiz results yet.</p>
          <Link href="/quiz" className="mt-2 text-primary underline underline-offset-2">
            Take the quiz
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {results.map((r) => (
            <li key={r.id}>
              <Link
                href={`/quiz/results/${r.resultToken}`}
                className="flex items-center justify-between rounded-lg border border-border p-4 hover:border-primary"
              >
                <div>
                  <p className="font-medium">{formatDate(r.createdAt)}</p>
                  <p className="text-sm text-muted-foreground">
                    Top match: {r.careers[0]?.career.title ?? "—"}
                    {r.careers[1] && `, ${r.careers[1].career.title}`}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
