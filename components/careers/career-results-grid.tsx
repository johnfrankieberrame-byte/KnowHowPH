"use client";

import { useEffect } from "react";
import { CareerCard, type CareerCardData } from "@/components/careers/career-card";
import { CompareBar } from "@/components/careers/compare-bar";
import { useCompareSelection } from "@/lib/hooks/use-compare-selection";
import { useAnalytics } from "@/lib/analytics/client";

export function CareerResultsGrid({ careers, query }: { careers: CareerCardData[]; query: string }) {
  const { slugs, toggle } = useCompareSelection();
  const analytics = useAnalytics();

  useEffect(() => {
    if (query) analytics.track("career_search_performed", { query, resultCount: careers.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, careers.length]);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {careers.map((career) => (
          <CareerCard
            key={career.slug}
            career={career}
            compareControl={{
              checked: slugs.includes(career.slug),
              disabled: slugs.length >= 3,
              onToggle: () => toggle(career.slug),
            }}
          />
        ))}
      </div>
      <CompareBar />
    </>
  );
}
