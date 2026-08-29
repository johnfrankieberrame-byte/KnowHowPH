"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuestionRenderer, type QuizQuestionData } from "@/components/quiz/question-renderer";
import { readDraft, writeDraft, clearDraft, type AnswerValue, type QuizDraft } from "@/lib/quiz/local-draft";
import { useAnalytics } from "@/lib/analytics/client";

export interface QuizSectionData {
  id: string;
  key: string;
  title: string;
  description: string;
  order: number;
  questions: QuizQuestionData[];
}

export interface QuizData {
  id: string;
  title: string;
  sections: QuizSectionData[];
}

export function QuizRunner({ quiz, attemptId }: { quiz: QuizData; attemptId: string }) {
  const sections = useMemo(() => [...quiz.sections].sort((a, b) => a.order - b.order), [quiz.sections]);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const analytics = useAnalytics();
  const hydrated = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const draft = readDraft();
    if (draft && draft.attemptId === attemptId) {
      setAnswers(draft.answers);
      setStepIndex(Math.min(draft.currentStep, sections.length - 1));
    }
    if (!sessionStorage.getItem(`quiz-start-${attemptId}`)) {
      sessionStorage.setItem(`quiz-start-${attemptId}`, String(Date.now()));
    }
  }, [attemptId, sections.length]);

  const currentSection = sections[stepIndex];
  const totalSteps = sections.length;
  const progressPct = Math.round(((stepIndex + 1) / totalSteps) * 100);

  function persistLocal(nextAnswers: Record<string, AnswerValue>, nextStep: number) {
    const draft: QuizDraft = { attemptId, quizId: quiz.id, currentStep: nextStep, answers: nextAnswers, updatedAt: Date.now() };
    writeDraft(draft);
  }

  function scheduleServerSave(nextAnswers: Record<string, AnswerValue>, nextStep: number) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(`/api/quiz/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStep: nextStep,
          answers: Object.entries(nextAnswers).map(([questionId, value]) => ({ questionId, value })),
        }),
      }).catch(() => {
        // Server save failed silently — local draft still protects progress.
      });
    }, 600);
  }

  function setAnswer(questionId: string, value: AnswerValue) {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: value };
      persistLocal(next, stepIndex);
      scheduleServerSave(next, stepIndex);
      return next;
    });
    setErrors((prev) => {
      if (!prev.has(questionId)) return prev;
      const next = new Set(prev);
      next.delete(questionId);
      return next;
    });
  }

  function validateSection(): boolean {
    const missing = new Set<string>();
    for (const q of currentSection.questions) {
      if (!q.isRequired) continue;
      const v = answers[q.id];
      const isEmpty = v == null || (Array.isArray(v) ? v.length === 0 : v === "");
      if (isEmpty) missing.add(q.id);
    }
    setErrors(missing);
    if (missing.size > 0) {
      document.getElementById(`question-${[...missing][0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  function goNext() {
    if (!validateSection()) return;
    analytics.track("quiz_section_completed", { sectionKey: currentSection.key });
    if (stepIndex < totalSteps - 1) {
      const next = stepIndex + 1;
      setStepIndex(next);
      persistLocal(answers, next);
      scheduleServerSave(answers, next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      submit();
    }
  }

  function goBack() {
    if (stepIndex === 0) return;
    const prev = stepIndex - 1;
    setStepIndex(prev);
    persistLocal(answers, prev);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await fetch(`/api/quiz/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, value]) => ({ questionId, value })),
        }),
      });
      const res = await fetch(`/api/quiz/attempts/${attemptId}/submit`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Failed to submit quiz.");
      }
      const { resultToken } = await res.json();
      const startedAt = Number(sessionStorage.getItem(`quiz-start-${attemptId}`)) || Date.now();
      analytics.track("quiz_completed", { quizSlug: quiz.id, durationSeconds: Math.round((Date.now() - startedAt) / 1000) });
      clearDraft();
      router.push(`/quiz/results/${resultToken}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page max-w-2xl py-10">
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Section {stepIndex + 1} of {totalSteps}
          </span>
          <span>{progressPct}%</span>
        </div>
        <Progress value={progressPct} className="mt-2" aria-label={`Quiz progress: ${progressPct}%`} />
      </div>

      <h1 className="text-2xl font-bold tracking-tight">{currentSection.title}</h1>
      <p className="mt-1 text-muted-foreground">{currentSection.description}</p>

      <div className="mt-6 space-y-4">
        {currentSection.questions
          .sort((a, b) => a.order - b.order)
          .map((q, i) => (
            <div id={`question-${q.id}`} key={q.id}>
              <QuestionRenderer
                question={q}
                value={answers[q.id]}
                onChange={(v) => setAnswer(q.id, v)}
                index={i + 1}
                error={errors.has(q.id)}
              />
            </div>
          ))}
      </div>

      {errors.size > 0 && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          Please answer the highlighted question{errors.size > 1 ? "s" : ""} before continuing.
        </p>
      )}
      {submitError && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {submitError}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <Button variant="outline" onClick={goBack} disabled={stepIndex === 0 || submitting}>
          <ArrowLeft /> Back
        </Button>
        <Button onClick={goNext} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="animate-spin" /> Scoring your results…
            </>
          ) : stepIndex < totalSteps - 1 ? (
            <>
              Next <ArrowRight />
            </>
          ) : (
            "See my results"
          )}
        </Button>
      </div>
    </div>
  );
}
