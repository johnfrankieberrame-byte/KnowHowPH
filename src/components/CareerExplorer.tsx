import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2, RotateCcw } from "lucide-react";
import type { Job } from "../types";
import { CATEGORIES } from "../types";
import JobCard from "./JobCard";

interface CareerExplorerProps {
  jobs: Job[];
  loading: boolean;
  searchTerm: string;
  onSelectJob: (job: Job) => void;
}

const PAGE_SIZE = 6;

export default function CareerExplorer({ jobs, loading, searchTerm, onSelectJob }: CareerExplorerProps) {
  const [category, setCategory] = useState<string>("All");
  const [showAllJobs, setShowAllJobs] = useState(false);

  const filteredJobs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesCategory = category === "All" || job.category === category;
      const matchesSearch =
        term.length === 0 ||
        job.title.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.category.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [jobs, category, searchTerm]);

  useEffect(() => {
    setShowAllJobs(false);
  }, [category, searchTerm]);

  const visibleJobs = showAllJobs ? filteredJobs : filteredJobs.slice(0, PAGE_SIZE);
  const remaining = filteredJobs.length - PAGE_SIZE;

  return (
    <section id="explorer" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div>
          <h2 className="font-serif text-4xl font-bold text-zinc-900">Career Explorer</h2>
          <p className="mt-2 text-zinc-500">Discover your future role across various industries.</p>
        </div>
        {loading && (
          <span className="ml-auto flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <Loader2 size={14} className="animate-spin" />
            Populating Careers...
          </span>
        )}
      </div>

      <div className="mb-10 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const active = category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-emerald-600 hover:text-emerald-600"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {filteredJobs.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white py-16 text-center text-zinc-500">
          No careers match your search yet. Try a different keyword or category.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleJobs.map((job) => (
            <JobCard key={job.id} job={job} onClick={() => onSelectJob(job)} />
          ))}
        </div>
      )}

      {filteredJobs.length > PAGE_SIZE && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAllJobs((prev) => !prev)}
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-bold text-zinc-900 hover:border-emerald-600 hover:text-emerald-600"
          >
            {showAllJobs ? (
              <>
                <RotateCcw size={16} /> Show Less
              </>
            ) : (
              <>
                Show More Careers ({remaining} more) <ChevronDown size={16} />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
