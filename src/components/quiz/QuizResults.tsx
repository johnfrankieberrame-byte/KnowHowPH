import { GraduationCap, RotateCcw, Sparkles, Target } from "lucide-react";
import type { QuizResult } from "../../types";

interface QuizResultsProps {
  result: QuizResult;
  onRetake: () => void;
}

export default function QuizResults({ result, onRetake }: QuizResultsProps) {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-emerald-600 p-8 text-white sm:p-10">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-100">
          <Sparkles size={16} /> Your Career Blueprint
        </div>
        <h3 className="font-serif text-3xl font-bold sm:text-4xl">Here's where your profile points.</h3>
        <p className="mt-4 max-w-2xl text-emerald-50">{result.summary}</p>
      </div>

      <div>
        <h4 className="mb-4 text-lg font-bold text-zinc-900">Top Career Matches</h4>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {result.matches.map((match) => (
            <div key={match.career} className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <h5 className="text-lg font-bold text-zinc-900">{match.career}</h5>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-emerald-100 text-sm font-bold text-emerald-600">
                  {Math.round(match.compatibility)}%
                </div>
              </div>
              <p className="text-sm text-zinc-500">{match.reason}</p>
              <dl className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Salary Range</dt>
                  <dd className="font-semibold text-zinc-900">{match.salaryRange}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Market Demand</dt>
                  <dd className="font-semibold text-zinc-900">{match.demand}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Remote Potential</dt>
                  <dd className="font-semibold text-zinc-900">{match.remotePotential}</dd>
                </div>
              </dl>
              <p className="mt-4 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-500">
                <span className="font-bold text-zinc-700">Pathway: </span>
                {match.pathway}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="mb-3 flex items-center gap-2 text-emerald-600">
            <GraduationCap size={18} />
            <h4 className="font-bold text-zinc-900">Recommended Education Path</h4>
          </div>
          <p className="text-sm text-zinc-600">{result.educationRecommendation}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="mb-3 flex items-center gap-2 text-blue-600">
            <Target size={18} />
            <h4 className="font-bold text-zinc-900">Philippine Market Insights</h4>
          </div>
          <p className="text-sm text-zinc-600">{result.marketInsights}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h4 className="mb-3 font-bold text-zinc-900">Skill Development Tips</h4>
        <ul className="space-y-2">
          {result.skillTips.map((tip) => (
            <li key={tip} className="flex gap-2 text-sm text-zinc-600">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onRetake}
          className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-bold text-zinc-900 hover:border-emerald-600 hover:text-emerald-600"
        >
          <RotateCcw size={16} /> Retake Quiz
        </button>
      </div>
    </div>
  );
}
