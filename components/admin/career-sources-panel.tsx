"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VerificationBadge } from "@/components/careers/verification-badge";

export type AdminSourceRef = {
  id: string;
  fieldContext: string;
  note: string | null;
  source: { id: string; title: string; publisher: string; url: string | null; verificationStatus: string };
};

export function CareerSourcesPanel({
  careerId,
  references,
  availableSources,
}: {
  careerId: string;
  references: AdminSourceRef[];
  availableSources: { id: string; title: string; publisher: string }[];
}) {
  const router = useRouter();
  const [sourceId, setSourceId] = useState("");
  const [fieldContext, setFieldContext] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function addReference(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!sourceId || !fieldContext.trim()) {
      setError("Choose a source and describe what it supports (e.g. \"salary\").");
      return;
    }
    setIsSubmitting(true);
    const res = await fetch(`/api/admin/careers/${careerId}/sources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId, fieldContext: fieldContext.trim(), note: note.trim() || null }),
    });
    setIsSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? "Failed to attach source.");
      return;
    }
    setSourceId("");
    setFieldContext("");
    setNote("");
    router.refresh();
  }

  async function deleteReference(refId: string) {
    setDeletingId(refId);
    const res = await fetch(`/api/admin/careers/${careerId}/sources/${refId}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-3 font-medium">Source</th>
              <th className="p-3 font-medium">Supports</th>
              <th className="p-3 font-medium">Note</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {references.map((ref) => (
              <tr key={ref.id}>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{ref.source.title}</span>
                    {ref.source.url && (
                      <a href={ref.source.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">{ref.source.publisher}</span>
                    <VerificationBadge status={ref.source.verificationStatus} className="text-[10px]" />
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{ref.fieldContext}</td>
                <td className="p-3 text-muted-foreground">{ref.note ?? "—"}</td>
                <td className="p-3 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteReference(ref.id)}
                    disabled={deletingId === ref.id}
                    aria-label={`Remove source ${ref.source.title}`}
                  >
                    {deletingId === ref.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </td>
              </tr>
            ))}
            {references.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-sm text-muted-foreground">
                  No sources attached yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={addReference} className="space-y-4 rounded-md border border-border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Attach a source</h3>
          <Link href="/admin/sources" className="text-xs font-medium text-primary hover:underline">
            + Create a new source
          </Link>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Source</Label>
            <Select value={sourceId} onValueChange={setSourceId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an existing source" />
              </SelectTrigger>
              <SelectContent>
                {availableSources.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.title} · {s.publisher}
                  </SelectItem>
                ))}
                {availableSources.length === 0 && (
                  <p className="px-2 py-1.5 text-xs text-muted-foreground">No data sources yet — create one first.</p>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Field context</Label>
            <Input
              placeholder='e.g. "salary", "demand"'
              value={fieldContext}
              onChange={(e) => setFieldContext(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Note (optional)</Label>
          <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Attach source
          </Button>
        </div>
      </form>
    </div>
  );
}
