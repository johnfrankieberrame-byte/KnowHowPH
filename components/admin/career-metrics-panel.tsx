"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatMetricType, formatRating, formatSalaryRange } from "@/lib/utils/format";

const METRIC_TYPES = ["SALARY", "DEMAND", "SATURATION", "REMOTE_VIABILITY", "FREELANCE_VIABILITY"];
const RATING_LEVELS = ["VERY_LOW", "LOW", "MODERATE", "HIGH", "VERY_HIGH"];
const STATUSES = ["POC_ESTIMATE", "VERIFIED", "NEEDS_REVIEW"];

export type AdminMetric = {
  id: string;
  metricType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  rating: string | null;
  status: string;
  periodLabel: string | null;
  methodologyNote: string | null;
  sourceId: string | null;
  source: { id: string; title: string } | null;
};

export function CareerMetricsPanel({
  careerId,
  metrics,
  sources,
}: {
  careerId: string;
  metrics: AdminMetric[];
  sources: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [metricType, setMetricType] = useState("SALARY");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [rating, setRating] = useState<string>("");
  const [status, setStatus] = useState("POC_ESTIMATE");
  const [sourceId, setSourceId] = useState<string>("");
  const [methodologyNote, setMethodologyNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function resetForm() {
    setMetricType("SALARY");
    setSalaryMin("");
    setSalaryMax("");
    setRating("");
    setStatus("POC_ESTIMATE");
    setSourceId("");
    setMethodologyNote("");
  }

  async function addMetric(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const res = await fetch(`/api/admin/careers/${careerId}/metrics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metricType,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        rating: rating || null,
        status,
        sourceId: sourceId || null,
        methodologyNote: methodologyNote || null,
      }),
    });
    setIsSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? "Failed to add metric.");
      return;
    }
    resetForm();
    router.refresh();
  }

  async function deleteMetric(metricId: string) {
    setDeletingId(metricId);
    const res = await fetch(`/api/admin/careers/${careerId}/metrics/${metricId}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Value</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Source</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {metrics.map((m) => (
              <tr key={m.id}>
                <td className="p-3 font-medium">{formatMetricType(m.metricType)}</td>
                <td className="p-3 text-muted-foreground">
                  {m.metricType === "SALARY" ? formatSalaryRange(m.salaryMin, m.salaryMax) : formatRating(m.rating)}
                </td>
                <td className="p-3">
                  <Badge variant={m.status === "VERIFIED" ? "success" : m.status === "NEEDS_REVIEW" ? "warning" : "muted"}>
                    {m.status.replace(/_/g, " ").toLowerCase()}
                  </Badge>
                </td>
                <td className="p-3 text-muted-foreground">{m.source?.title ?? "—"}</td>
                <td className="p-3 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMetric(m.id)}
                    disabled={deletingId === m.id}
                    aria-label={`Delete ${formatMetricType(m.metricType)} metric`}
                  >
                    {deletingId === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </td>
              </tr>
            ))}
            {metrics.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                  No metrics recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={addMetric} className="space-y-4 rounded-md border border-border p-4">
        <h3 className="text-sm font-semibold">Add metric</h3>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Metric type</Label>
            <Select value={metricType} onValueChange={setMetricType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRIC_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {formatMetricType(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ").toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Source</Label>
            <Select value={sourceId} onValueChange={setSourceId}>
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {metricType === "SALARY" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Salary min (PHP)</Label>
              <Input type="number" min={0} value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Salary max (PHP)</Label>
              <Input type="number" min={0} value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label>Rating</Label>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger>
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                {RATING_LEVELS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {formatRating(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Methodology note (optional)</Label>
          <Textarea rows={2} value={methodologyNote} onChange={(e) => setMethodologyNote(e.target.value)} />
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Add metric
          </Button>
        </div>
      </form>
    </div>
  );
}
