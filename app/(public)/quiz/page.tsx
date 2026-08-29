import type { Metadata } from "next";
import { Clock, ShieldCheck, Sparkles, ListChecks } from "lucide-react";
import { getActiveQuiz } from "@/lib/quiz/service";
import { SECTION_LABELS, QUIZ_SECTION_ORDER } from "@/lib/quiz/traits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizStartButton } from "@/components/quiz/quiz-start-button";

export const metadata: Metadata = {
  title: "Career quiz",
  description:
    "Take KnowHow's free, ~10-minute career exploration quiz. Get deterministic, transparent career matches — not a personality diagnosis.",
  alternates: { canonical: "/quiz" },
};

export default async function QuizIntroPage() {
  const quiz = await getActiveQuiz();
  const questionCount = quiz.sections.reduce((sum, s) => sum + s.questions.length, 0);

  return (
    <div className="container-page max-w-3xl py-14">
      <div className="text-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          <Clock className="h-3.5 w-3.5" /> About 8–12 minutes
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{quiz.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{quiz.description}</p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="items-center text-center">
            <ListChecks className="h-6 w-6 text-primary" />
            <CardTitle className="text-base">{questionCount} questions</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            Across {QUIZ_SECTION_ORDER.length} sections covering personality, skills, work style, goals, and readiness.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="items-center text-center">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <CardTitle className="text-base">Exploratory, not diagnostic</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            This is a career-exploration tool, not a psychological or hiring assessment. Never used for recruitment.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="items-center text-center">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle className="text-base">Transparent matching</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            Results come from a deterministic, versioned scoring model you can inspect — AI only explains them.
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 rounded-lg border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
        <h2 className="font-semibold text-foreground">Sections you'll answer</h2>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {QUIZ_SECTION_ORDER.map((key) => (
            <li key={key}>• {SECTION_LABELS[key]}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8 rounded-lg border border-border p-5 text-sm text-muted-foreground">
        <h2 className="font-semibold text-foreground">Before you start</h2>
        <p className="mt-2">
          You can take this quiz anonymously — your progress is saved in your browser so you can resume later. If
          you sign in, we'll also save your results to your account. Your answers are treated as personal
          preference data and are never used for recruitment, hiring, or automated screening. Read our{" "}
          <a href="/privacy" className="text-primary underline underline-offset-2">
            privacy policy
          </a>{" "}
          for details.
        </p>
      </div>

      <div className="mt-10 flex justify-center">
        <QuizStartButton quizId={quiz.id} />
      </div>
    </div>
  );
}
