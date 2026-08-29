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
import { formatPublicationStatus, formatSchoolType, formatVerificationStatus } from "@/lib/utils/format";

const SCHOOL_TYPES = ["PUBLIC", "PRIVATE", "STATE_UNIVERSITY_COLLEGE", "TRAINING_PROVIDER", "ONLINE_PROVIDER"];
const VERIFICATION_STATUSES = ["POC_SEED", "UNVERIFIED", "NEEDS_REVIEW", "VERIFIED", "ARCHIVED"];
const PUBLICATION_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export type SchoolFormValues = {
  name: string;
  slug: string;
  type: string;
  region: string;
  provinceCity: string;
  website: string;
  description: string;
  accreditationNote: string;
  verificationStatus: string;
  publicationStatus: string;
};

const EMPTY: SchoolFormValues = {
  name: "",
  slug: "",
  type: "PRIVATE",
  region: "",
  provinceCity: "",
  website: "",
  description: "",
  accreditationNote: "",
  verificationStatus: "POC_SEED",
  publicationStatus: "PUBLISHED",
};

export function SchoolFormDialog({
  mode,
  schoolId,
  defaults,
}: {
  mode: "create" | "edit";
  schoolId?: string;
  defaults?: SchoolFormValues;
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
  } = useForm<SchoolFormValues>({ defaultValues: defaults ?? EMPTY });

  async function onSubmit(values: SchoolFormValues) {
    setServerError(null);
    const url = mode === "create" ? "/api/admin/schools" : `/api/admin/schools/${schoolId}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, website: values.website || null, accreditationNote: values.accreditationNote || null }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      if (body?.error?.fieldErrors) {
        for (const [field, messages] of Object.entries(body.error.fieldErrors as Record<string, string[]>)) {
          setError(field as keyof SchoolFormValues, { message: messages[0] });
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
            <Plus className="h-4 w-4" /> New school
          </Button>
        ) : (
          <Button size="sm" variant="ghost">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New school" : "Edit school"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="sch-name">Name</Label>
              <Input id="sch-name" {...register("name", { required: true })} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message ?? "Required."}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sch-slug">Slug</Label>
              <Input id="sch-slug" {...register("slug", { required: true })} />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message ?? "Required."}</p>}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={watch("type")} onValueChange={(v) => setValue("type", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCHOOL_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {formatSchoolType(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sch-region">Region</Label>
              <Input id="sch-region" {...register("region", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sch-provinceCity">Province / city</Label>
              <Input id="sch-provinceCity" {...register("provinceCity", { required: true })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sch-website">Website (optional)</Label>
            <Input id="sch-website" type="url" {...register("website")} />
            {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sch-description">Description</Label>
            <Textarea id="sch-description" rows={3} {...register("description", { required: true })} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sch-accreditationNote">Accreditation note (optional)</Label>
            <Textarea id="sch-accreditationNote" rows={2} {...register("accreditationNote")} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
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
            <div className="space-y-1.5">
              <Label>Publication status</Label>
              <Select value={watch("publicationStatus")} onValueChange={(v) => setValue("publicationStatus", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PUBLICATION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {formatPublicationStatus(s)}
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
