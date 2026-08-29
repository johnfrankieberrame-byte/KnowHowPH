"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PublicationStatusBadge } from "@/components/admin/publication-status-badge";
import { VerificationBadge } from "@/components/careers/verification-badge";
import { formatDate, formatVerificationStatus } from "@/lib/utils/format";

const VERIFICATION_STATUSES = ["POC_SEED", "UNVERIFIED", "NEEDS_REVIEW", "VERIFIED", "ARCHIVED"];
const PUBLICATION_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export function CareerStatusPanel({
  careerId,
  publicationStatus,
  verificationStatus,
  lastReviewedAt,
  nextReviewDueAt,
}: {
  careerId: string;
  publicationStatus: string;
  verificationStatus: string;
  lastReviewedAt: Date | string | null;
  nextReviewDueAt: Date | string | null;
}) {
  const router = useRouter();
  const [reviewStatus, setReviewStatus] = useState(verificationStatus);
  const [note, setNote] = useState("");
  const [nextDue, setNextDue] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsReviewing(true);
    const res = await fetch(`/api/admin/careers/${careerId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        verificationStatus: reviewStatus,
        note: note.trim() || undefined,
        nextReviewDueAt: nextDue || undefined,
      }),
    });
    setIsReviewing(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? "Failed to record review.");
      return;
    }
    setNote("");
    router.refresh();
  }

  async function setPublication(status: string) {
    setError(null);
    setIsPublishing(true);
    const res = await fetch(`/api/admin/careers/${careerId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicationStatus: status }),
    });
    setIsPublishing(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? "Failed to update publication status.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-4 rounded-md border border-border p-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Publication</p>
          <div className="mt-1"><PublicationStatusBadge status={publicationStatus} /></div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Verification</p>
          <div className="mt-1"><VerificationBadge status={verificationStatus} /></div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Last reviewed</p>
          <p className="mt-1 text-sm">{formatDate(lastReviewedAt)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Next review due</p>
          <p className="mt-1 text-sm">{formatDate(nextReviewDueAt)}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {PUBLICATION_STATUSES.filter((s) => s !== publicationStatus).map((s) => (
            <Button key={s} type="button" size="sm" variant="outline" disabled={isPublishing} onClick={() => setPublication(s)}>
              {isPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Set {s.toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      <form onSubmit={submitReview} className="space-y-4 rounded-md border border-border p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4" /> Record a review
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>New verification status</Label>
            <Select value={reviewStatus} onValueChange={setReviewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VERIFICATION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {formatVerificationStatus(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Next review due (optional — defaults to +6 months)</Label>
            <Input type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Note (optional, recorded in the audit log)</Label>
          <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isReviewing}>
            {isReviewing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
            Save review
          </Button>
        </div>
      </form>
    </div>
  );
}
