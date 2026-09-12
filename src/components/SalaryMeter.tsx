import type { Job } from "../types";

const CEILING = 250000;

export default function SalaryMeter({ job }: { job: Job }) {
  const minPct = Math.min(100, (job.min_salary / CEILING) * 100);
  const maxPct = Math.min(100, (job.max_salary / CEILING) * 100);
  const avgPct = Math.min(100, (job.avg_salary / CEILING) * 100);
  const tooltipPct = Math.min(92, Math.max(8, avgPct));

  return (
    <div>
      <div className="mb-9 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">Salary Range (Monthly)</span>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
          PH Market Data
        </span>
      </div>

      <div className="relative h-4 rounded-full bg-zinc-800/50">
        <div
          className="absolute inset-y-0 rounded-full border-x border-emerald-500/30 bg-emerald-500/20"
          style={{ left: `${minPct}%`, width: `${Math.max(2, maxPct - minPct)}%` }}
        />
        <div
          className="absolute inset-y-0 w-1 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
          style={{ left: `${avgPct}%` }}
        />
        <div
          className="absolute -top-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-800 px-2 py-1 text-[11px] font-bold text-emerald-300"
          style={{ left: `${tooltipPct}%` }}
        >
          Avg: ₱{job.avg_salary.toLocaleString()}
        </div>
      </div>

      <div className="mt-2 flex justify-between text-xs text-zinc-500">
        <span>Min: ₱{job.min_salary.toLocaleString()}</span>
        <span>Max: ₱{job.max_salary.toLocaleString()}</span>
      </div>
    </div>
  );
}
