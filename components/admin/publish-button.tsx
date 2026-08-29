"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublishButton({
  careerId,
  publicationStatus,
  size = "sm",
}: {
  careerId: string;
  publicationStatus: string;
  size?: "sm" | "default";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (publicationStatus === "PUBLISHED") {
    return <span className="text-xs text-muted-foreground">Published</span>;
  }

  function publish() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/careers/${careerId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicationStatus: "PUBLISHED" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error?.message ?? "Failed to publish.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button size={size} variant="outline" onClick={publish} disabled={isPending}>
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        Publish
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
