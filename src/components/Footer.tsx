import { GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <GraduationCap size={16} />
              </span>
              <span className="text-lg font-bold text-zinc-900">KnowHow.ph</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-zinc-500">
              The Philippine career intelligence platform. Know the path. Know the pay.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
              Philippine Career Resources
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>
                <a href="https://www.tesda.gov.ph" target="_blank" rel="noreferrer" className="hover:text-emerald-600">
                  TESDA — Technical Education & Skills Development
                </a>
              </li>
              <li>
                <a href="https://www.dole.gov.ph" target="_blank" rel="noreferrer" className="hover:text-emerald-600">
                  DOLE — Department of Labor and Employment
                </a>
              </li>
              <li>
                <a href="https://dict.gov.ph" target="_blank" rel="noreferrer" className="hover:text-emerald-600">
                  DICT Digital Careers Initiatives
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-100 pt-6 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} KnowHow.ph. All rights reserved.</p>
          <p className="mt-2 max-w-3xl">
            Salaries and market figures represent estimated industry averages based on Metro Manila,
            Cebu, and remote work contractor indices. They are illustrative benchmarks, not guarantees
            of pay or employment outcomes, and may not reflect every employer, region, or seniority
            level.
          </p>
        </div>
      </div>
    </footer>
  );
}
