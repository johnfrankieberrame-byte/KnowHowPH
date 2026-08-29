"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatSourceType, formatVerificationStatus } from "@/lib/utils/format";

const SOURCE_TYPES = [
  "GOVERNMENT",
  "SCHOOL",
  "EMPLOYER",
  "JOB_PLATFORM",
  "PROFESSIONAL_BODY",
  "RESEARCH",
  "INTERNAL_POC",
  "OTHER",
];
const VERIFICATION_STATUSES = ["POC_SEED", "UNVERIFIED", "NEEDS_REVIEW", "VERIFIED", "ARCHIVED"];

export type SourceFormValues = {
  title: string;
  publisher: string;
  url: string;
  sourceType: string;
  sourceDate: string;
  retrievedDate: string;
  methodologySummary: string;
  verificationStatus: string;
  notes: string;
  archivedUrl: string;
};

const EMPTY: SourceFormValues = {
  title: "",
  publisher: "",
  url: "",
  sourceType: "GOVERNMENT",
  sourceDate: "",
  retrievedDate: "",
  methodologySummary: "",
  verificationStatus: "UNVERIFIED",
  notes: "",
  archivedUrl: "",
};

export function SourceFormDialog({
  mode,
  sourceId,
  defaults,
}: {
  mode: "create" | "edit";
  sourceId?: string;
  defaults?: SourceFormValues;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SourceFormValues>({ defaultValues: defaults ?? EMPTY });

  async function onSubmit(values: SourceFormValues) {
    setServerError(null);
    const url = mode === "create" ? "/api/admin/sources" : `/api/admin/sources/${sourceId}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        url: values.url || null,
        archivedUrl: values.archivedUrl || null,
        sourceDate: values.sourceDate || null,
        retrievedDate: values.retrievedDate || null,
        methodologySummary: values.methodologySummary || null,
        notes: values.notes || null,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      if (body?.error?.fieldErrors) {
        for (const [field, messages] of Object.entries(body.error.fieldErrors as Record<string, string[]>)) {
          setError(field as keyof SourceFormValues, { message: messages[0] });
        }
      }
      setServerError(body?.error?.message ?? "Something went wrong.");
      return;
    }
    setOpen(false);
    reset(defaults ?? EMPTY);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setServerError(null);
      }}
    >
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button size="sm">
            <Plus className="h-4 w-4" /> New source
          </Button>
        ) : (
          <Button size="sm" variant="ghost">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New data source" : "Edit data source"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="src-title">Title</Label>
              <Input id="src-title" {...register("title", { required: true })} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message ?? "Required."}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="src-publisher">Publisher</Label>
              <Input id="src-publisher" {...register("publisher", { required: true })} />
              {errors.publisher && <p className="text-xs text-destructive">{errors.publisher.message ?? "Required."}</p>}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="src-url">URL (optional)</Label>
              <Input id="src-url" type="url" {...register("url")} />
              {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Source type</Label>
              <Select value={watch("sourceType")} onValueChange={(v) => setValue("sourceType", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {formatSourceType(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="src-sourceDate">Source date (optional)</Label>
              <Input id="src-sourceDate" type="date" {...register("sourceDate")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="src-retrievedDate">Retrieved date (optional)</Label>
              <Input id="src-retrievedDate" type="date" {...register("retrievedDate")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="src-methodologySummary">Methodology summary (optional)</Label>
            <Textarea id="src-methodologySummary" rows={2} {...register("methodologySummary")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="src-notes">Notes (optional)</Label>
            <Textarea id="src-notes" rows={2} {...register("notes")} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="src-archivedUrl">Archived URL (optional)</Label>
              <Input id="src-archivedUrl" type="url" {...register("archivedUrl")} />
              {errors.archivedUrl && <p className="text-xs text-destructive">{errors.archivedUrl.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Verification status</Label>
              <Select value={watch("verificationStatus")} onValueChange={(v) => setValue("verificationStatus", v)}>
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
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
