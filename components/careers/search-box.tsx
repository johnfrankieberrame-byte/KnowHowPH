"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Briefcase, Building2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAnalytics } from "@/lib/analytics/client";

interface Suggestion {
  type: "career" | "industry" | "skill";
  slug: string;
  label: string;
  meta?: string;
}

const ICONS = { career: Briefcase, industry: Building2, skill: Sparkles };

export function SearchBox({ size = "default" }: { size?: "default" | "lg" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [debounced, setDebounced] = useState("");
  const router = useRouter();
  const analytics = useAnalytics();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const { data } = useQuery({
    queryKey: ["search-suggestions", debounced],
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(debounced)}`);
      if (!res.ok) throw new Error("Search failed");
      return (await res.json()) as { careers: Suggestion[]; industries: Suggestion[]; skills: Suggestion[] };
    },
    enabled: debounced.length > 1,
  });

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function goToCareerExplorer() {
    if (!query.trim()) return;
    analytics.track("career_search_performed", { query: query.trim(), resultCount: suggestions.length });
    router.push(`/careers?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
  }

  const suggestions: Suggestion[] = data
    ? [...data.careers, ...data.industries, ...data.skills]
    : [];

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          goToCareerExplorer();
        }}
      >
        <label htmlFor="site-search" className="sr-only">
          Search careers, industries, or skills
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="site-search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search careers, industries, or skills (e.g. “data analyst”, “nursing”)"
            className={size === "lg" ? "h-12 pl-9 text-base" : "pl-9"}
            autoComplete="off"
            aria-expanded={open && suggestions.length > 0}
            aria-controls="search-suggestions"
          />
        </div>
      </form>
      {open && debounced.length > 1 && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-border bg-card shadow-lg"
        >
          {suggestions.map((s) => {
            const Icon = ICONS[s.type];
            const href = s.type === "career" ? `/careers/${s.slug}` : s.type === "industry" ? `/industries/${s.slug}` : `/careers?skill=${s.slug}`;
            return (
              <li key={`${s.type}-${s.slug}`}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    setOpen(false);
                    router.push(href);
                  }}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{s.label}</span>
                  {s.meta && <span className="ml-auto text-xs text-muted-foreground">{s.meta}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
