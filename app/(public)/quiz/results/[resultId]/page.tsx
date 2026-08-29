import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { getQuizResultByToken } from "@/lib/quiz/service";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ResultCareerCard } from "@/components/quiz/result-career-card";
import { AiInsightPanel } from "@/components/quiz/ai-insight-panel";
import { SaveResultButton } from "@/components/quiz/save-result-button";
import type { AiQuizResult } from "@/lib/ai/schema";

export const metadata: Metadata = { title: "Your career quiz results", robots: { index: false } };

export default async function QuizResultPage({ params }: { params: Promise<{ resultId: string }> }) {
  const { resultId } = await params;
  const result = await getQuizResultByToken(resultId).catch(() => null);
  if (!result) notFound();

  const user = await getCurrentUser().catch(() => null);

  const succeededGeneration = result.aiGenerations.find((g) => g.status === "SUCCEEDED");
  const initialInsight = (succeededGeneration?.responseJson as AiQuizResult | undefined) ?? null;

  const [top3, rest] = [result.careers.slice(0, 3), result.careers.slice(3, 5)];

  return (
    <div className="container-page max-w-3xl py-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Your top career matches</h1>
        <p className="mt-2 text-muted-foreground">
          Based on your answers, computed with our deterministic, versioned scoring model (v{result.calculationVersion}).
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Button asChild variant="outline">
            <Link href="/quiz">
              <RotateCcw /> Retake the quiz
            </Link>
          </Button>
          {user && <SaveResultButton resultToken={result.resultToken} alreadySaved={result.userId === user.id} />}
        </div>
      </div>

      <Alert variant="info" className="mt-8">
        <AlertTitle>These are informational estimates, not guarantees</AlertTitle>
        <AlertDescription>
          Your results reflect how closely your answers align with each career's profile — not a promise of
          success, income, or admission. Use them as a starting point for further research.
        </AlertDescription>
      </Alert>

      <section className="mt-8 space-y-5">
        <h2 className="text-xl font-semibold">Your top 3 matches</h2>
        {top3.map((rc) => (
          <ResultCareerCard
            key={rc.id}
            featured
            result={{
              rank: rc.rank,
              adjustedScore: rc.adjustedScore,
              matchReasons: rc.matchReasons,
              tradeOffs: rc.tradeOffs,
              scoreBreakdown: rc.scoreBreakdown as ResultCareerCardBreakdown,
              career: rc.career,
            }}
          />
        ))}
      </section>

      {rest.length > 0 && (
        <section className="mt-10 space-y-5">
          <h2 className="text-xl font-semibold">Also worth exploring</h2>
          {rest.map((rc) => (
            <ResultCareerCard
              key={rc.id}
              result={{
                rank: rc.rank,
                adjustedScore: rc.adjustedScore,
                matchReasons: rc.matchReasons,
                tradeOffs: rc.tradeOffs,
                scoreBreakdown: rc.scoreBreakdown as ResultCareerCardBreakdown,
                career: rc.career,
              }}
            />
          ))}
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Get a personalized explanation</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Optional — powered by Gemini AI, built strictly from the results above.
        </p>
        <div className="mt-4">
          <AiInsightPanel resultToken={result.resultToken} initialInsight={initialInsight} />
        </div>
      </section>
    </div>
  );
}

type ResultCareerCardBreakdown = {
  sectionFits: Record<string, number>;
  adjustments: Record<string, number>;
  softPenalties: number;
};
