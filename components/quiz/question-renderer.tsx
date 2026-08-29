"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import type { AnswerValue } from "@/lib/quiz/local-draft";

export interface QuizOptionData {
  id: string;
  label: string;
  value: string;
  order: number;
}

export interface QuizQuestionData {
  id: string;
  type: "LIKERT_5" | "SINGLE_SELECT" | "MULTI_SELECT" | "SKILL_RATING" | "SCENARIO";
  prompt: string;
  helpText: string | null;
  isRequired: boolean;
  order: number;
  options: QuizOptionData[];
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  index,
  error,
}: {
  question: QuizQuestionData;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  index: number;
  error?: boolean;
}) {
  const options = [...question.options].sort((a, b) => a.order - b.order);
  const isMulti = question.type === "MULTI_SELECT";
  const isLikert = question.type === "LIKERT_5";

  return (
    <fieldset
      className={cn(
        "rounded-lg border p-4",
        error ? "border-destructive bg-destructive/5" : "border-border"
      )}
      aria-required={question.isRequired}
    >
      <legend className="px-1 text-sm font-medium leading-snug">
        <span className="text-muted-foreground">{index}.</span> {question.prompt}
        {question.isRequired && <span className="text-destructive"> *</span>}
      </legend>
      {question.helpText && <p className="mt-1 px-1 text-xs text-muted-foreground">{question.helpText}</p>}

      <div className={cn("mt-3", isLikert ? "flex flex-wrap justify-between gap-2" : "space-y-2")}>
        {isMulti
          ? options.map((opt) => {
              const current = Array.isArray(value) ? value : [];
              const checked = current.includes(opt.value);
              return (
                <div key={opt.id} className="flex items-center gap-2">
                  <Checkbox
                    id={opt.id}
                    checked={checked}
                    onCheckedChange={() => {
                      const next = checked ? current.filter((v) => v !== opt.value) : [...current, opt.value];
                      onChange(next);
                    }}
                  />
                  <Label htmlFor={opt.id} className="cursor-pointer font-normal">
                    {opt.label}
                  </Label>
                </div>
              );
            })
          : (
              <RadioGroup value={typeof value === "string" ? value : ""} onValueChange={(v) => onChange(v)}>
                {options.map((opt) => (
                  <div
                    key={opt.id}
                    className={cn(
                      "flex items-center gap-2",
                      isLikert && "flex-col text-center text-xs w-16"
                    )}
                  >
                    <RadioGroupItem value={opt.value} id={opt.id} />
                    <Label htmlFor={opt.id} className="cursor-pointer font-normal">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
      </div>
    </fieldset>
  );
}
