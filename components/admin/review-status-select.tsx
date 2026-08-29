"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatVerificationStatus } from "@/lib/utils/format";

const STATUSES = ["POC_SEED", "UNVERIFIED", "NEEDS_REVIEW", "VERIFIED", "ARCHIVED"] as const;

/**
 * Inline verification-status control. Changing the value immediately POSTs
 * to the review endpoint, which also stamps lastReviewedAt / nextReviewDueAt.
 */
export function ReviewStatusSelect({
  careerId,
  verificationStatus,
  onDone,
}: {
  careerId: string;
  verificationStatus: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  function handleChange(next: string) {
    if (next === verificationStatus) return;
    setError(null);
    setJustSaved(false);
    startTransition(async () => {
      const res = await fetch(`/api/admin/careers/${careerId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus: next }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error?.message ?? "Failed to update.");
        return;
      }
      setJustSaved(true);
      onDone?.();
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <Select value={verificationStatus} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger className="h-8 w-[150px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s} className="text-xs">
              {formatVerificationStatus(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />}
      {justSaved && !isPending && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
