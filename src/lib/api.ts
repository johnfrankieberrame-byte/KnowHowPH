import type { Job, QuizAnswers, QuizResult } from "../types";

export async function fetchJobs(): Promise<Job[]> {
  const res = await fetch("/api/jobs");
  if (!res.ok) throw new Error("Failed to load careers");
  return res.json();
}

export async function analyzeQuiz(answers: QuizAnswers): Promise<QuizResult> {
  const res = await fetch("/api/quiz/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to analyze quiz results");
  }
  return res.json();
}
