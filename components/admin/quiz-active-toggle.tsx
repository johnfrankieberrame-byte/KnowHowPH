"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuizActiveToggle({ quizId, isActive }: { quizId: string; isActive: boolean }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function toggle() {
    setIsPending(true);
    const res = await fetch(`/api/admin/quiz/${quizId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setIsPending(false);
    if (res.ok) router.refresh();
  }

  return (
    <Button size="sm" variant={isActive ? "outline" : "default"} onClick={toggle} disabled={isPending}>
      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}
