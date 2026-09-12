import { GraduationCap } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="#" className="flex items-center gap-2 hover:opacity-80">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <GraduationCap size={20} />
          </span>
          <span className="text-xl font-bold tracking-tight text-zinc-900">KnowHow.ph</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#explorer" className="text-sm font-medium text-zinc-600 hover:text-emerald-600">
            Explorer
          </a>
          <a href="#quiz" className="text-sm font-medium text-zinc-600 hover:text-emerald-600">
            Career Quiz
          </a>
          <a href="#insights" className="text-sm font-medium text-zinc-600 hover:text-emerald-600">
            Market Insights
          </a>
        </nav>

        <button
          type="button"
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Sign In
        </button>
      </div>
    </header>
  );
}
