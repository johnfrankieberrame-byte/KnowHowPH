"use client";

const DRAFT_KEY = "knowhow:quiz-draft:v1";

export type AnswerValue = string | string[];

export interface QuizDraft {
  attemptId: string;
  quizId: string;
  currentStep: number;
  answers: Record<string, AnswerValue>;
  updatedAt: number;
}

export function readDraft(): QuizDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as QuizDraft) : null;
  } catch {
    return null;
  }
}

export function writeDraft(draft: QuizDraft) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // localStorage unavailable (private mode, quota) — autosave degrades to server-only.
  }
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
