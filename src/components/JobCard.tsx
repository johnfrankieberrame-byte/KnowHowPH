import { ArrowRight, Briefcase, CheckCircle2 } from "lucide-react";
import type { Job } from "../types";

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

export default function JobCard({ job, onClick }: JobCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="mb-4 flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Briefcase size={20} />
        </span>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          {job.category}
        </span>
      </div>

      {job.remote_rating === "Fully Remote Friendly" && (
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
          <CheckCircle2 size={12} /> Remote Certified
        </div>
      )}

      <h3 className="text-lg font-bold text-zinc-900">{job.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{job.description}</p>

      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
        <span className="text-sm font-bold text-zinc-900">
          Avg. Pay: ₱{job.avg_salary.toLocaleString()}
        </span>
        <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
          View Path <ArrowRight size={14} />
        </span>
      </div>
    </div>
  );
}
