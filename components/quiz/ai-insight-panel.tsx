"use client";

import { useState } from "react";
import { Sparkles, Loader2, AlertCircle, Lightbulb, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAnalytics } from "@/lib/analytics/client";
import type { AiQuizResult } from "@/lib/ai/schema";

const TIMEFRAME_LABELS: Record<string, string> = { "30_days": "Next 30 days", "60_days": "Next 60 days", "90_days": "Next 90 days" };

export function AiInsightPanel({
  resultToken,
  initialInsight,
}: {
  resultToken: string;
  initialInsight: AiQuizResult | null;
}) {
  const [insight, setInsight] = useState<AiQuizResult | null>(initialInsight);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const analytics = useAnalytics();

  async function requestInsight() {
    setStatus("loading");
    analytics.track("ai_insight_requested", { resultToken });
    try {
      const res = await fetch(`/api/quiz/results/${resultToken}/ai-insight`, { method: "POST" });
      const body = await res.json();
      if (!res.ok || body.status !== "SUCCEEDED") {
        setStatus("error");
        return;
      }
      setInsight(body.responseJson as AiQuizResult);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  if (!insight && status === "idle") {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <Sparkles className="h-8 w-8 text-secondary" />
          <div>
            <p className="font-semibold">Want a personalized explanation?</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Get an AI-generated, plain-language explanation of your matches, trade-offs, and next steps — built
              only from the deterministic results above. This is optional and informational, not a guarantee.
            </p>
          </div>
          <Button onClick={requestInsight}>
            <Sparkles /> Get personalized insight
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "loading") {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p>Writing your personalized explanation…</p>
        </CardContent>
      </Card>
    );
  }

  if (status === "error" || !insight) {
    return (
      <Alert variant="warning">
        <AlertCircle />
        <AlertDescription>
          We couldn't generate a personalized explanation right now. Your deterministic results above are complete
          and unaffected — you can{" "}
          <button onClick={requestInsight} className="underline underline-offset-2">
            try again
          </button>
          .
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <Sparkles className="h-5 w-5 text-secondary" />
          <CardTitle>Your personalized summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{insight.summary}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {insight.strengths.map((s) => (
              <div key={s.title} className="rounded-md border border-border p-3">
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  <Lightbulb className="h-3.5 w-3.5 text-secondary" /> {s.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{s.explanation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {insight.topCareerInsights.map((ci) => (
        <Card key={ci.careerId}>
          <CardHeader>
            <CardTitle className="text-base">{ci.careerTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Why it fits</p>
              <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                {ci.whyItFits.map((r, i) => <li key={i}>• {r}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Trade-offs</p>
              <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                {ci.tradeOffs.map((r, i) => <li key={i}>• {r}</li>)}
              </ul>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground">
                <Target className="h-3.5 w-3.5" /> Next steps
              </p>
              <ul className="mt-2 space-y-2">
                {ci.nextSteps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                      {TIMEFRAME_LABELS[step.timeframe]}
                    </span>
                    <span className="text-muted-foreground">{step.action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}

      {insight.adjacentPaths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Adjacent paths worth a look</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {insight.adjacentPaths.map((p) => (
              <p key={p.careerId}>• {p.reason}</p>
            ))}
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertDescription>{insight.disclaimer}</AlertDescription>
      </Alert>
    </div>
  );
}
