"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readDraft, clearDraft } from "@/lib/quiz/local-draft";
import { useAnalytics } from "@/lib/analytics/client";

export function QuizStartButton({ quizId }: { quizId: string }) {
  const [draftAttemptId, setDraftAttemptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const analytics = useAnalytics();

  useEffect(() => {
    const draft = readDraft();
    if (draft && draft.quizId === quizId) setDraftAttemptId(draft.attemptId);
  }, [quizId]);

  async function startNew() {
    setLoading(true);
    clearDraft();
    try {
      const res = await fetch("/api/quiz/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId }),
      });
      if (!res.ok) throw new Error("Failed to start quiz");
      const attempt = await res.json();
      analytics.track("quiz_started", { quizSlug: quizId });
      router.push(`/quiz/take?attempt=${attempt.id}`);
    } catch {
      setLoading(false);
    }
  }

  function resume() {
    if (!draftAttemptId) return;
    router.push(`/quiz/take?attempt=${draftAttemptId}`);
  }

  if (draftAttemptId) {
    return (
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button size="lg" onClick={resume}>
          <RotateCcw /> Resume where you left off
        </Button>
        <Button size="lg" variant="outline" onClick={startNew} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />} Start over
        </Button>
      </div>
    );
  }

  return (
    <Button size="lg" onClick={startNew} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" /> : <Sparkles />} Start the quiz
    </Button>
  );
}
