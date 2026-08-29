import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QuizActiveToggle } from "@/components/admin/quiz-active-toggle";
import { getAllQuizzesForAdmin } from "@/lib/db/queries/admin";
import { SECTION_LABELS, SECTION_WEIGHTS, type QuizSectionKeyLiteral } from "@/lib/quiz/traits";

export const metadata: Metadata = { title: "Quiz" };
export const dynamic = "force-dynamic";

const QUESTION_TYPE_LABELS: Record<string, string> = {
  LIKERT_5: "Likert (1–5)",
  SINGLE_SELECT: "Single select",
  MULTI_SELECT: "Multi select",
  SKILL_RATING: "Skill rating",
  SCENARIO: "Scenario",
};

export default async function AdminQuizPage() {
  const quizzes = await getAllQuizzesForAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Quiz structure</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Read-only inspection of quiz sections and questions.
        </p>
      </div>

      <Alert variant="info" className="mb-6">
        <AlertDescription>
          Full question-bank editing is out of scope for this MVP pass — questions, options, and trait weights per
          option are managed via the seed/config layer (<code>prisma/seed-data/quiz.ts</code>). This page lets you
          inspect structure and toggle which quiz is active.
        </AlertDescription>
      </Alert>

      {quizzes.length === 0 && (
        <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No quiz has been configured yet.
        </p>
      )}

      <div className="space-y-6">
        {quizzes.map((quiz) => {
          const questionCount = quiz.sections.reduce((sum, s) => sum + s.questions.length, 0);
          const typeBreakdown = new Map<string, number>();
          for (const section of quiz.sections) {
            for (const q of section.questions) {
              typeBreakdown.set(q.type, (typeBreakdown.get(q.type) ?? 0) + 1);
            }
          }

          return (
            <Card key={quiz.id}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>{quiz.title}</CardTitle>
                    <Badge variant={quiz.isActive ? "success" : "muted"}>{quiz.isActive ? "Active" : "Inactive"}</Badge>
                    <Badge variant="outline">v{quiz.version}</Badge>
                  </div>
                  <CardDescription className="mt-1">{quiz.description}</CardDescription>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {questionCount} questions · {quiz.sections.length} sections · {quiz._count.attempts} attempts ·{" "}
                    {Array.from(typeBreakdown.entries())
                      .map(([type, count]) => `${count} ${QUESTION_TYPE_LABELS[type] ?? type}`)
                      .join(", ")}
                  </p>
                </div>
                <QuizActiveToggle quizId={quiz.id} isActive={quiz.isActive} />
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {quiz.sections.map((section) => (
                    <div key={section.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <div>
                        <p className="font-medium">
                          {SECTION_LABELS[section.key as QuizSectionKeyLiteral] ?? section.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{section.description}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                        <span>{section.questions.length} questions</span>
                        <Badge variant="outline">
                          weight {((SECTION_WEIGHTS[section.key as QuizSectionKeyLiteral] ?? section.weight) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
