"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  formatEducationLevel,
  formatEntryDifficulty,
  formatPublicationStatus,
  formatRating,
  formatVerificationStatus,
} from "@/lib/utils/format";

const EDUCATION_LEVELS = [
  "HIGH_SCHOOL",
  "TESDA_CERTIFICATE",
  "ASSOCIATE_OR_DIPLOMA",
  "BACHELORS",
  "POSTGRADUATE",
  "LICENSE_REQUIRED",
  "VARIES",
];
const ENTRY_DIFFICULTIES = ["EASY", "MODERATE", "HARD", "VERY_HARD"];
const RATING_LEVELS = ["VERY_LOW", "LOW", "MODERATE", "HIGH", "VERY_HIGH"];
const PUBLICATION_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const VERIFICATION_STATUSES = ["POC_SEED", "UNVERIFIED", "NEEDS_REVIEW", "VERIFIED", "ARCHIVED"];

export type CareerFormDefaults = {
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  primaryIndustryId: string;
  primaryCategoryId: string;
  responsibilities: string[];
  goodFitIf: string[];
  challengingIf: string[];
  workEnvironment: string;
  workStyleSummary: string;
  educationLevel: string;
  entryDifficulty: string;
  timeToEntryMinMonths: number;
  timeToEntryMaxMonths: number;
  remoteViability: string;
  freelanceViability: string;
  entryLevelTitle: string;
  midLevelTitle: string;
  seniorLevelTitle: string;
  seoTitle: string;
  seoDescription: string;
  publicationStatus: string;
  verificationStatus: string;
};

type FormValues = Omit<CareerFormDefaults, "responsibilities" | "goodFitIf" | "challengingIf"> & {
  responsibilities: string;
  goodFitIf: string;
  challengingIf: string;
};

function toFormValues(defaults: CareerFormDefaults): FormValues {
  return {
    ...defaults,
    responsibilities: defaults.responsibilities.join("\n"),
    goodFitIf: defaults.goodFitIf.join("\n"),
    challengingIf: defaults.challengingIf.join("\n"),
  };
}

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function CareerCoreForm({
  mode,
  careerId,
  defaults,
  industries,
  categories,
}: {
  mode: "create" | "edit";
  careerId?: string;
  defaults: CareerFormDefaults;
  industries: { id: string; name: string }[];
  categories: { id: string; name: string; industryId: string }[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: toFormValues(defaults) });

  const selectedIndustryId = watch("primaryIndustryId");
  const availableCategories = useMemo(
    () => categories.filter((c) => c.industryId === selectedIndustryId),
    [categories, selectedIndustryId]
  );

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const payload = {
      ...values,
      responsibilities: splitLines(values.responsibilities),
      goodFitIf: splitLines(values.goodFitIf),
      challengingIf: splitLines(values.challengingIf),
      timeToEntryMinMonths: Number(values.timeToEntryMinMonths),
      timeToEntryMaxMonths: Number(values.timeToEntryMaxMonths),
      workStyleSummary: values.workStyleSummary || null,
      entryLevelTitle: values.entryLevelTitle || null,
      midLevelTitle: values.midLevelTitle || null,
      seniorLevelTitle: values.seniorLevelTitle || null,
      seoTitle: values.seoTitle || null,
      seoDescription: values.seoDescription || null,
    };

    const url = mode === "create" ? "/api/admin/careers" : `/api/admin/careers/${careerId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      if (body?.error?.fieldErrors) {
        for (const [field, messages] of Object.entries(body.error.fieldErrors as Record<string, string[]>)) {
          setError(field as keyof FormValues, { message: messages[0] });
        }
      }
      setServerError(body?.error?.message ?? "Something went wrong. Please try again.");
      return;
    }

    const saved = await res.json();
    if (mode === "create") {
      router.push(`/admin/careers/${saved.id}`);
    } else {
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title", { required: true })} aria-invalid={Boolean(errors.title)} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message ?? "Required."}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register("slug", { required: true })} aria-invalid={Boolean(errors.slug)} />
          {errors.slug && <p className="text-xs text-destructive">{errors.slug.message ?? "Required."}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="shortDescription">Short description</Label>
        <Textarea id="shortDescription" rows={2} {...register("shortDescription", { required: true })} />
        {errors.shortDescription && <p className="text-xs text-destructive">{errors.shortDescription.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="longDescription">Long description</Label>
        <Textarea id="longDescription" rows={5} {...register("longDescription", { required: true })} />
        {errors.longDescription && <p className="text-xs text-destructive">{errors.longDescription.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="primaryIndustryId">Primary industry</Label>
          <Select
            value={watch("primaryIndustryId")}
            onValueChange={(v) => {
              setValue("primaryIndustryId", v);
              setValue("primaryCategoryId", "");
            }}
          >
            <SelectTrigger id="primaryIndustryId">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.primaryIndustryId && <p className="text-xs text-destructive">Required.</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="primaryCategoryId">Primary category</Label>
          <Select value={watch("primaryCategoryId")} onValueChange={(v) => setValue("primaryCategoryId", v)}>
            <SelectTrigger id="primaryCategoryId">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
              {availableCategories.length === 0 && (
                <p className="px-2 py-1.5 text-xs text-muted-foreground">Pick an industry first.</p>
              )}
            </SelectContent>
          </Select>
          {errors.primaryCategoryId && <p className="text-xs text-destructive">Required.</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="responsibilities">Responsibilities (one per line)</Label>
          <Textarea id="responsibilities" rows={5} {...register("responsibilities")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="goodFitIf">Good fit if… (one per line)</Label>
          <Textarea id="goodFitIf" rows={5} {...register("goodFitIf")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="challengingIf">Challenging if… (one per line)</Label>
          <Textarea id="challengingIf" rows={5} {...register("challengingIf")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="workEnvironment">Work environment</Label>
        <Textarea id="workEnvironment" rows={2} {...register("workEnvironment", { required: true })} />
        {errors.workEnvironment && <p className="text-xs text-destructive">{errors.workEnvironment.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="workStyleSummary">Work style summary (optional)</Label>
        <Textarea id="workStyleSummary" rows={2} {...register("workStyleSummary")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="educationLevel">Education level</Label>
          <Select value={watch("educationLevel")} onValueChange={(v) => setValue("educationLevel", v)}>
            <SelectTrigger id="educationLevel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_LEVELS.map((v) => (
                <SelectItem key={v} value={v}>
                  {formatEducationLevel(v)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="entryDifficulty">Entry difficulty</Label>
          <Select value={watch("entryDifficulty")} onValueChange={(v) => setValue("entryDifficulty", v)}>
            <SelectTrigger id="entryDifficulty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENTRY_DIFFICULTIES.map((v) => (
                <SelectItem key={v} value={v}>
                  {formatEntryDifficulty(v)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="remoteViability">Remote viability</Label>
          <Select value={watch("remoteViability")} onValueChange={(v) => setValue("remoteViability", v)}>
            <SelectTrigger id="remoteViability">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RATING_LEVELS.map((v) => (
                <SelectItem key={v} value={v}>
                  {formatRating(v)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="freelanceViability">Freelance viability</Label>
          <Select value={watch("freelanceViability")} onValueChange={(v) => setValue("freelanceViability", v)}>
            <SelectTrigger id="freelanceViability">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RATING_LEVELS.map((v) => (
                <SelectItem key={v} value={v}>
                  {formatRating(v)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="timeToEntryMinMonths">Time to entry — min months</Label>
          <Input
            id="timeToEntryMinMonths"
            type="number"
            min={0}
            {...register("timeToEntryMinMonths", { required: true, valueAsNumber: true })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="timeToEntryMaxMonths">Time to entry — max months</Label>
          <Input
            id="timeToEntryMaxMonths"
            type="number"
            min={0}
            {...register("timeToEntryMaxMonths", { required: true, valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="entryLevelTitle">Entry-level title (optional)</Label>
          <Input id="entryLevelTitle" {...register("entryLevelTitle")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="midLevelTitle">Mid-level title (optional)</Label>
          <Input id="midLevelTitle" {...register("midLevelTitle")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seniorLevelTitle">Senior-level title (optional)</Label>
          <Input id="seniorLevelTitle" {...register("seniorLevelTitle")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="seoTitle">SEO title (optional)</Label>
          <Input id="seoTitle" {...register("seoTitle")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seoDescription">SEO description (optional)</Label>
          <Input id="seoDescription" {...register("seoDescription")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="publicationStatus">Publication status</Label>
          <Select value={watch("publicationStatus")} onValueChange={(v) => setValue("publicationStatus", v)}>
            <SelectTrigger id="publicationStatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PUBLICATION_STATUSES.map((v) => (
                <SelectItem key={v} value={v}>
                  {formatPublicationStatus(v)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="verificationStatus">Verification status</Label>
          <Select value={watch("verificationStatus")} onValueChange={(v) => setValue("verificationStatus", v)}>
            <SelectTrigger id="verificationStatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VERIFICATION_STATUSES.map((v) => (
                <SelectItem key={v} value={v}>
                  {formatVerificationStatus(v)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {mode === "create" ? "Create career" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
