import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { careerSearchQuerySchema } from "@/lib/validations/careers";
import { searchCareers } from "@/lib/search/careers";
import { getFilterOptions } from "@/lib/db/queries/careers";
import { CareerFilters } from "@/components/careers/career-filters";
import { ExplorerToolbar } from "@/components/careers/explorer-toolbar";
import { CareerResultsGrid } from "@/components/careers/career-results-grid";
import { Pagination } from "@/components/careers/pagination";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Career explorer",
  description: "Search and filter career paths in the Philippines by industry, education level, salary band, demand, and more.",
  alternates: { canonical: "/careers" },
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function CareersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const flat: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (value !== undefined) flat[key] = value;
  }
  const query = careerSearchQuerySchema.parse(flat);

  const [{ items, total, page, totalPages }, filterOptions] = await Promise.all([
    searchCareers(query),
    getFilterOptions(),
  ]);

  function buildHref(nextPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(sp)) {
      if (key === "page" || value === undefined) continue;
      if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
      else params.set(key, value);
    }
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return `/careers${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="container-page py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Career explorer</h1>
        <p className="mt-1 text-muted-foreground">
          {total} published career{total === 1 ? "" : "s"} across {filterOptions.industries.length} industries.
        </p>
      </div>

      <div className="mb-6">
        <ExplorerToolbar initialQuery={query.q ?? ""} initialSort={query.sort} />
      </div>

      <div className="flex gap-8">
        <CareerFilters
          industries={filterOptions.industries.map((i) => ({ value: i.slug, label: i.name }))}
          categories={filterOptions.categories.map((c) => ({ value: c.slug, label: c.name }))}
        />

        <div className="flex-1">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
              <SearchX className="h-10 w-10 text-muted-foreground" aria-hidden />
              <h2 className="mt-4 text-lg font-semibold">No careers matched your filters</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Try removing a filter or searching a broader term. New careers are added regularly.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/careers">Clear filters</Link>
              </Button>
            </div>
          ) : (
            <>
              <CareerResultsGrid
                query={query.q ?? ""}
                careers={items.map((c) => ({
                  ...c,
                  salary: (() => {
                    const m = c.metrics.find((x) => x.metricType === "SALARY");
                    return m ? { min: m.salaryMin, max: m.salaryMax } : null;
                  })(),
                  demand: c.metrics.find((x) => x.metricType === "DEMAND")?.rating ?? null,
                }))}
              />
              <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
