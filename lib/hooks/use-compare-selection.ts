"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "knowhow:compare-slugs";
const MAX_COMPARE = 3;

function readStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Persists up to 3 career slugs selected for comparison across pages. */
export function useCompareSelection() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(readStorage());
  }, []);

  const persist = useCallback((next: string[]) => {
    setSlugs(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage unavailable — selection just won't persist across reloads.
    }
  }, []);

  const toggle = useCallback(
    (slug: string) => {
      const current = readStorage();
      if (current.includes(slug)) {
        persist(current.filter((s) => s !== slug));
      } else if (current.length < MAX_COMPARE) {
        persist([...current, slug]);
      }
    },
    [persist]
  );

  const clear = useCallback(() => persist([]), [persist]);

  return { slugs, toggle, clear, max: MAX_COMPARE };
}
