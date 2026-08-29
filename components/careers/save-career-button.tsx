"use client";

import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/lib/analytics/client";

export function SaveCareerButton({
  careerId,
  careerSlug,
  isSignedIn,
  initiallySaved,
}: {
  careerId: string;
  careerSlug: string;
  isSignedIn: boolean;
  initiallySaved: boolean;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const analytics = useAnalytics();

  if (!isSignedIn) {
    return (
      <Button asChild variant="outline">
        <a href="/account">
          <Bookmark /> Sign in to save
        </a>
      </Button>
    );
  }

  function toggle() {
    setError(null);
    startTransition(async () => {
      try {
        if (saved) {
          const res = await fetch(`/api/saved-careers/${careerId}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Failed to unsave");
          setSaved(false);
        } else {
          const res = await fetch(`/api/saved-careers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ careerId }),
          });
          if (!res.ok && res.status !== 409) throw new Error("Failed to save");
          setSaved(true);
          analytics.track("career_saved", { careerSlug });
        }
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div>
      <Button variant={saved ? "default" : "outline"} onClick={toggle} disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : saved ? <BookmarkCheck /> : <Bookmark />}
        {saved ? "Saved" : "Save career"}
      </Button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
