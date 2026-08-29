"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CONSTRAINT_KEYS,
  CONSTRAINT_LABELS,
  QUIZ_SECTION_ORDER,
  SECTION_LABELS,
  TRAIT_KEYS,
  TRAIT_LABELS,
  TRAIT_SECTION_MAP,
  type TraitKey,
  type ConstraintKey,
} from "@/lib/quiz/traits";

export type QuizProfileDefaults = {
  idealTraits: Partial<Record<TraitKey, number>>;
  traitWeights: Partial<Record<TraitKey, number>>;
  hardConstraints: ConstraintKey[];
  calculationVersion: number;
};

const DEFAULT_IDEAL = 50;
const DEFAULT_WEIGHT = 1;

export function CareerQuizProfilePanel({
  careerId,
  defaults,
  hasProfile,
}: {
  careerId: string;
  defaults: QuizProfileDefaults;
  hasProfile: boolean;
}) {
  const router = useRouter();
  const [idealTraits, setIdealTraits] = useState<Record<TraitKey, number>>(() => {
    const record = {} as Record<TraitKey, number>;
    for (const key of TRAIT_KEYS) record[key] = defaults.idealTraits[key] ?? DEFAULT_IDEAL;
    return record;
  });
  const [traitWeights, setTraitWeights] = useState<Record<TraitKey, number>>(() => {
    const record = {} as Record<TraitKey, number>;
    for (const key of TRAIT_KEYS) record[key] = defaults.traitWeights[key] ?? DEFAULT_WEIGHT;
    return record;
  });
  const [hardConstraints, setHardConstraints] = useState<Set<ConstraintKey>>(new Set(defaults.hardConstraints));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const traitsBySection = useMemo(() => {
    const grouped = new Map<string, TraitKey[]>();
    for (const section of QUIZ_SECTION_ORDER) grouped.set(section, []);
    for (const trait of TRAIT_KEYS) {
      const section = TRAIT_SECTION_MAP[trait];
      grouped.get(section)!.push(trait);
    }
    return grouped;
  }, []);

  function toggleConstraint(key: ConstraintKey) {
    setHardConstraints((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setIsSubmitting(true);

    const res = await fetch(`/api/admin/careers/${careerId}/quiz-profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idealTraits,
        traitWeights,
        hardConstraints: Array.from(hardConstraints),
        calculationVersion: defaults.calculationVersion,
      }),
    });

    setIsSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? "Failed to save quiz profile.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {!hasProfile && (
        <Alert variant="info">
          <AlertDescription>
            This career has no quiz-matching profile yet — it won&apos;t appear in quiz results until you save one.
            Values below start at neutral defaults (ideal 50, weight 1).
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {saved && (
        <Alert variant="info">
          <AlertDescription>Quiz profile saved.</AlertDescription>
        </Alert>
      )}

      <p className="text-sm text-muted-foreground">
        For each trait, set the <span className="font-medium text-foreground">ideal</span> value (0–100) this career
        represents, and how much that trait should <span className="font-medium text-foreground">weight</span> in the
        match score (0–3; 0 ignores it, 1 is normal, 3 is decisive).
      </p>

      <div className="space-y-6">
        {QUIZ_SECTION_ORDER.map((section) => (
          <div key={section} className="rounded-md border border-border">
            <div className="border-b border-border bg-muted/40 px-4 py-2">
              <h3 className="text-sm font-semibold">{SECTION_LABELS[section]}</h3>
            </div>
            <div className="divide-y divide-border">
              {traitsBySection.get(section)!.map((trait) => (
                <div key={trait} className="grid grid-cols-[1fr_100px_100px] items-center gap-3 px-4 py-2.5">
                  <Label htmlFor={`ideal-${trait}`} className="font-normal">
                    {TRAIT_LABELS[trait]}
                  </Label>
                  <div className="space-y-0.5">
                    <Input
                      id={`ideal-${trait}`}
                      type="number"
                      min={0}
                      max={100}
                      value={idealTraits[trait]}
                      onChange={(e) =>
                        setIdealTraits((prev) => ({ ...prev, [trait]: clamp(Number(e.target.value), 0, 100) }))
                      }
                      className="h-8 text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground">ideal 0–100</p>
                  </div>
                  <div className="space-y-0.5">
                    <Input
                      id={`weight-${trait}`}
                      type="number"
                      min={0}
                      max={3}
                      step={0.1}
                      value={traitWeights[trait]}
                      onChange={(e) =>
                        setTraitWeights((prev) => ({ ...prev, [trait]: clamp(Number(e.target.value), 0, 3) }))
                      }
                      className="h-8 text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground">weight 0–3</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-border p-4">
        <h3 className="text-sm font-semibold">Hard constraints</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          If a quiz-taker selects one of these, this career is excluded outright — not just penalized.
        </p>
        <div className="mt-3 space-y-2">
          {CONSTRAINT_KEYS.map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <Checkbox checked={hardConstraints.has(key)} onCheckedChange={() => toggleConstraint(key)} />
              {CONSTRAINT_LABELS[key]}
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save quiz profile
        </Button>
      </div>
    </form>
  );
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}
