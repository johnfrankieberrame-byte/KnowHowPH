"use client";

import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatSchoolType, formatVerificationStatus } from "@/lib/utils/format";

const SCHOOL_TYPES = [
  "PUBLIC",
  "PRIVATE",
  "STATE_UNIVERSITY_COLLEGE",
  "TRAINING_PROVIDER",
  "ONLINE_PROVIDER",
] as const;

const VERIFICATION_STATUSES = ["POC_SEED", "UNVERIFIED", "VERIFIED", "NEEDS_REVIEW"] as const;

const ALL_VALUE = "all";

export function SchoolFilters({ regions }: { regions: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const region = searchParams.get("region") ?? ALL_VALUE;
  const type = searchParams.get("type") ?? ALL_VALUE;
  const status = searchParams.get("status") ?? ALL_VALUE;

  const hasActiveFilters = region !== ALL_VALUE || type !== ALL_VALUE || status !== ALL_VALUE;

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === ALL_VALUE) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      startTransition(() => {
        router.push(params.size ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  return (
    <div
      className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-end"
      aria-busy={isPending}
    >
      <div className="flex min-w-[10rem] flex-1 flex-col gap-1.5">
        <Label htmlFor="filter-region">Region</Label>
        <Select value={region} onValueChange={(v) => setParam("region", v)}>
          <SelectTrigger id="filter-region">
            <SelectValue placeholder="All regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All regions</SelectItem>
            {regions.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex min-w-[10rem] flex-1 flex-col gap-1.5">
        <Label htmlFor="filter-type">School type</Label>
        <Select value={type} onValueChange={(v) => setParam("type", v)}>
          <SelectTrigger id="filter-type">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All types</SelectItem>
            {SCHOOL_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {formatSchoolType(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex min-w-[10rem] flex-1 flex-col gap-1.5">
        <Label htmlFor="filter-status">Verification</Label>
        <Select value={status} onValueChange={(v) => setParam("status", v)}>
          <SelectTrigger id="filter-status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
            {VERIFICATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {formatVerificationStatus(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => startTransition(() => router.push(pathname, { scroll: false }))}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
