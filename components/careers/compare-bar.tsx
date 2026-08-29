"use client";

import Link from "next/link";
import { Scale, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompareSelection } from "@/lib/hooks/use-compare-selection";

export function CompareBar() {
  const { slugs, clear } = useCompareSelection();

  if (slugs.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-lg">
        <Scale className="h-4 w-4 text-primary" aria-hidden />
        <span className="text-sm">
          {slugs.length} career{slugs.length > 1 ? "s" : ""} selected
        </span>
        <Button asChild size="sm" disabled={slugs.length < 2}>
          <Link href={`/careers/compare?slugs=${slugs.join(",")}`}>Compare</Link>
        </Button>
        <Button size="sm" variant="ghost" onClick={clear} aria-label="Clear comparison selection">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
