"use client";

import { useState, useTransition } from "react";
import { BookmarkCheck, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SaveResultButton({ resultToken, alreadySaved }: { resultToken: string; alreadySaved: boolean }) {
  const [saved, setSaved] = useState(alreadySaved);
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const res = await fetch(`/api/quiz/results/${resultToken}/save`, { method: "POST" });
      if (res.ok) setSaved(true);
    });
  }

  if (saved) {
    return (
      <Button variant="outline" disabled>
        <BookmarkCheck /> Saved to your account
      </Button>
    );
  }

  return (
    <Button variant="outline" onClick={save} disabled={isPending}>
      {isPending ? <Loader2 className="animate-spin" /> : <Save />} Save to your account
    </Button>
  );
}
