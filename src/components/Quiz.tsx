import { useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { quizQuestions } from "../data/quizQuestions";
import type { LikertValue, QuizAnswers, QuizResult } from "../types";
import { analyzeQuiz } from "../lib/api";
import LikertControl from "./quiz/LikertControl";
import RatingControl from "./quiz/RatingControl";
import ChoiceControl from "./quiz/ChoiceControl";
import QuizResults from "./quiz/QuizResults";

export default function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);

  const question = quizQuestions[step];
  const isLast = step === quizQuestions.length - 1;
  const currentAnswer = answers[question?.id];
  const canAdvance = currentAnswer !== undefined && currentAnswer !== "";

  const handleAnswer = (value: LikertValue | number | string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = async () => {
    if (!canAdvance) return;
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }

    setStatus("loading");
    setError(null);
    try {
      const analysis = await analyzeQuiz(answers);
      setResult(analysis);
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong analyzing your results.");
      setStatus("error");
    }
  };

  const handleRetake = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
    setStatus("idle");
    setError(null);
  };

  return (
    <section id="quiz" className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="font-serif text-4xl font-bold text-zinc-900">AI Career Guidance Quiz</h2>
        <p className="mt-2 text-zinc-500">
          18 questions, 6 weighted dimensions, one AI-powered career blueprint.
        </p>
      </div>

      {result ? (
        <QuizResults result={result} onRetake={handleRetake} />
      ) : (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10">
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
              <span>{question.section}</span>
              <span>
                Question {step + 1} / {quizQuestions.length}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-100">
              <motion.div
                className="h-full rounded-full bg-emerald-600"
                animate={{ width: `${((step + 1) / quizQuestions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="mb-8 text-center text-xl font-bold text-zinc-900 sm:text-2xl">
                {question.text}
              </h3>

              {question.type === "likert" && (
                <LikertControl value={currentAnswer as LikertValue | undefined} onChange={handleAnswer} />
              )}
              {question.type === "rating" && (
                <RatingControl value={currentAnswer as number | undefined} onChange={handleAnswer} />
              )}
              {question.type === "choice" && question.choices && (
                <ChoiceControl
                  choices={question.choices}
                  value={currentAnswer as string | undefined}
                  onChange={handleAnswer}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {status === "error" && (
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || status === "loading"}
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-zinc-500 disabled:opacity-0"
            >
              <ArrowLeft size={16} /> Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance || status === "loading"}
              className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Analyzing...
                </>
              ) : isLast ? (
                "Get My Career Blueprint"
              ) : (
                <>
                  Next <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
