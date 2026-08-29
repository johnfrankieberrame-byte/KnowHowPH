"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ComparePicker({ currentSlugs }: { currentSlugs: string[] }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["compare-search", query],
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return { careers: [] };
      return res.json() as Promise<{ careers: { slug: string; label: string }[] }>;
    },
    enabled: query.trim().length > 1 && currentSlugs.length < 3,
  });

  if (currentSlugs.length >= 3) return null;

  function addCareer(slug: string) {
    const next = [...currentSlugs, slug];
    router.push(`/careers/compare?slugs=${next.join(",")}`);
    setQuery("");
  }

  return (
    <div className="relative max-w-sm">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Add another career to compare…"
      />
      {data?.careers && data.careers.length > 0 && query.trim().length > 1 && (
        <ul className="absolute z-20 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
          {data.careers
            .filter((c) => !currentSlugs.includes(c.slug))
            .map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  onClick={() => addCareer(c.slug)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  <Plus className="h-3.5 w-3.5" /> {c.label}
                </button>
              </li>
            ))}
        </ul>
      )}
      <Button type="button" variant="ghost" size="sm" className="mt-1" disabled>
        {3 - currentSlugs.length} slot{3 - currentSlugs.length === 1 ? "" : "s"} remaining
      </Button>
    </div>
  );
}
