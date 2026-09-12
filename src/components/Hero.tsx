import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface HeroProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function Hero({ searchTerm, onSearchChange }: HeroProps) {
  const [draft, setDraft] = useState(searchTerm);

  const handleExplore = () => {
    onSearchChange(draft);
    document.getElementById("explorer")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute -top-24 left-0 h-96 w-96 rounded-full bg-emerald-50/50 blur-3xl" />
      <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-blue-50/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700"
        >
          <Sparkles size={16} />
          Localized for the Philippines
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-6xl font-bold tracking-tight text-zinc-900 sm:text-8xl"
        >
          Know the path.
          <br />
          <span className="italic text-emerald-600">Know the pay.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-zinc-500"
        >
          The Philippine career intelligence platform that helps you choose careers based on real
          data, clear direction, and market demand.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-10 flex max-w-md items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl"
        >
          <Search size={20} className="ml-2 shrink-0 text-zinc-400" />
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleExplore()}
            placeholder="Search careers (e.g. Developer, VA)"
            className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleExplore}
            className="shrink-0 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700"
          >
            Explore
          </button>
        </motion.div>
      </div>
    </section>
  );
}
