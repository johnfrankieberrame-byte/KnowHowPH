import { Laptop, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Job, MarketSaturation } from "../types";
import SalaryMeter from "./SalaryMeter";

interface JobModalProps {
  job: Job | null;
  onClose: () => void;
}

const SATURATION_STYLES: Record<MarketSaturation, { color: string; bar: string; width: string }> = {
  Undersupplied: { color: "text-emerald-400", bar: "bg-emerald-400", width: "85%" },
  Balanced: { color: "text-blue-400", bar: "bg-blue-400", width: "55%" },
  Oversupplied: { color: "text-amber-400", bar: "bg-amber-400", width: "30%" },
};

function growthWidth(growthOutlook: string): number {
  const match = growthOutlook.match(/(\d+)/);
  const value = match ? Number(match[1]) : 10;
  return Math.min(100, Math.max(10, value * 2));
}

export default function JobModal({ job, onClose }: JobModalProps) {
  return (
    <AnimatePresence>
      {job && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-zinc-900/40 p-4 py-10 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl rounded-[2.5rem] bg-white p-6 shadow-2xl sm:p-10"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {job.category}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                <Laptop size={14} /> {job.remote_rating}
              </span>
            </div>

            <h2 className="font-serif text-4xl font-bold text-zinc-900 sm:text-5xl">{job.title}</h2>

            <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <section>
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-zinc-400">The Role</h3>
                  <p className="text-zinc-600">{job.description}</p>
                </section>

                <section className="mt-8">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-zinc-400">
                    Career Pathway
                  </h3>
                  <div className="relative space-y-6 border-l border-zinc-200 pl-6">
                    {job.pathway.map((stage, i) => (
                      <div key={stage} className="relative">
                        <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-600" />
                        <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                          Stage {i + 1}
                        </p>
                        <p className="font-semibold text-zinc-900">{stage}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-zinc-400">
                      Core Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-zinc-400">
                      Key Tools
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {job.tools.map((tool) => (
                        <span
                          key={tool}
                          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              <div className="rounded-3xl bg-zinc-900 p-8 text-white">
                <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-zinc-400">
                  PH Career Meter
                </h3>

                <SalaryMeter job={job} />

                <div className="mt-8">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-white">Market Saturation</span>
                    <span className={`font-bold ${SATURATION_STYLES[job.market_saturation].color}`}>
                      {job.market_saturation}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-zinc-800/50">
                    <div
                      className={`h-full rounded-full ${SATURATION_STYLES[job.market_saturation].bar}`}
                      style={{ width: SATURATION_STYLES[job.market_saturation].width }}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-white">Growth Outlook</span>
                    <span className="font-bold text-emerald-400">{job.growth_outlook}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-zinc-800/50">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{ width: `${growthWidth(job.growth_outlook)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
