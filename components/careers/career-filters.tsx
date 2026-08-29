"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useAnalytics } from "@/lib/analytics/client";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
}

const RATING_OPTIONS: FilterOption[] = [
  { value: "VERY_LOW", label: "Very low" },
  { value: "LOW", label: "Low" },
  { value: "MODERATE", label: "Moderate" },
  { value: "HIGH", label: "High" },
  { value: "VERY_HIGH", label: "Very high" },
];

const EDUCATION_OPTIONS: FilterOption[] = [
  { value: "HIGH_SCHOOL", label: "High school diploma" },
  { value: "TESDA_CERTIFICATE", label: "TESDA certificate" },
  { value: "ASSOCIATE_OR_DIPLOMA", label: "Associate / diploma" },
  { value: "BACHELORS", label: "Bachelor's degree" },
  { value: "POSTGRADUATE", label: "Postgraduate" },
  { value: "LICENSE_REQUIRED", label: "Professional license" },
  { value: "VARIES", label: "Varies" },
];

const DIFFICULTY_OPTIONS: FilterOption[] = [
  { value: "EASY", label: "Easy" },
  { value: "MODERATE", label: "Moderate" },
  { value: "HARD", label: "Hard" },
  { value: "VERY_HARD", label: "Very hard" },
];

const STATUS_OPTIONS: FilterOption[] = [
  { value: "POC_SEED", label: "POC seed data" },
  { value: "UNVERIFIED", label: "Unverified" },
  { value: "NEEDS_REVIEW", label: "Needs review" },
  { value: "VERIFIED", label: "Verified" },
];

function buildGroups(industries: FilterOption[], categories: FilterOption[]): FilterGroup[] {
  return [
    { key: "industry", label: "Industry", options: industries },
    { key: "category", label: "Category", options: categories },
    { key: "educationLevel", label: "Education level", options: EDUCATION_OPTIONS },
    { key: "demand", label: "Market demand", options: RATING_OPTIONS },
    { key: "saturation", label: "Saturation / competition", options: RATING_OPTIONS },
    { key: "remote", label: "Remote viability", options: RATING_OPTIONS },
    { key: "freelance", label: "Freelance viability", options: RATING_OPTIONS },
    { key: "entryDifficulty", label: "Entry difficulty", options: DIFFICULTY_OPTIONS },
    { key: "status", label: "Data status", options: STATUS_OPTIONS },
  ];
}

function FilterGroups({
  groups,
  selected,
  onToggle,
}: {
  groups: FilterGroup[];
  selected: Record<string, string[]>;
  onToggle: (key: string, value: string) => void;
}) {
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <details key={group.key} className="group" open={group.key === "industry"}>
          <summary className="cursor-pointer list-none text-sm font-semibold">
            {group.label}
          </summary>
          <div className="mt-2 space-y-2">
            {group.options.map((opt) => {
              const id = `${group.key}-${opt.value}`;
              const checked = selected[group.key]?.includes(opt.value) ?? false;
              return (
                <div key={id} className="flex items-center gap-2">
                  <Checkbox id={id} checked={checked} onCheckedChange={() => onToggle(group.key, opt.value)} />
                  <Label htmlFor={id} className="cursor-pointer text-sm font-normal text-muted-foreground">
                    {opt.label}
                  </Label>
                </div>
              );
            })}
          </div>
        </details>
      ))}
    </div>
  );
}

export function CareerFilters({
  industries,
  categories,
}: {
  industries: FilterOption[];
  categories: FilterOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const analytics = useAnalytics();
  const [open, setOpen] = useState(false);

  const groups = useMemo(() => buildGroups(industries, categories), [industries, categories]);

  const selected = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const group of groups) {
      result[group.key] = searchParams.getAll(group.key);
    }
    return result;
  }, [groups, searchParams]);

  function toggle(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll(key);
    params.delete(key);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    for (const v of next) params.append(key, v);
    params.delete("page");
    analytics.track("career_filter_applied", { filterKey: key, filterValue: value });
    router.push(`${pathname}?${params.toString()}`);
  }

  function reset() {
    const params = new URLSearchParams(searchParams.toString());
    for (const group of groups) params.delete(group.key);
    const q = params.get("q");
    router.push(`${pathname}${q ? `?q=${q}` : ""}`);
  }

  const activeCount = Object.values(selected).reduce((sum, v) => sum + v.length, 0);

  return (
    <>
      <aside className="hidden w-64 shrink-0 md:block">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Filters</h2>
          {activeCount > 0 && (
            <button onClick={reset} className="text-xs text-primary underline-offset-2 hover:underline">
              Clear all
            </button>
          )}
        </div>
        <div className="mt-4">
          <FilterGroups groups={groups} selected={selected} onToggle={toggle} />
        </div>
      </aside>

      <div className="md:hidden">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal /> Filters {activeCount > 0 && `(${activeCount})`}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader className="flex-row items-center justify-between space-y-0">
              <DialogTitle>Filters</DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" aria-label="Close filters">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogHeader>
            <FilterGroups groups={groups} selected={selected} onToggle={toggle} />
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={reset}>
                Clear all
              </Button>
              <DialogClose asChild>
                <Button className="flex-1">Show results</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
