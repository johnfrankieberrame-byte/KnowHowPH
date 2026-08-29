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
import { formatCredentialType, formatDeliveryMode, formatPublicationStatus, formatVerificationStatus } from "@/lib/utils/format";

const CREDENTIAL_TYPES = ["DEGREE", "DIPLOMA", "CERTIFICATE", "TESDA_ALIGNED", "BOOTCAMP", "SHORT_COURSE"];
const DELIVERY_MODES = ["IN_PERSON", "ONLINE", "HYBRID"];
const VERIFICATION_STATUSES = ["POC_SEED", "UNVERIFIED", "NEEDS_REVIEW", "VERIFIED", "ARCHIVED"];
const PUBLICATION_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export type ProgramFormValues = {
  name: string;
  slug: string;
  credentialType: string;
  durationLabel: string;
  deliveryMode: string;
  admissionNotes: string;
  tuitionNote: string;
  verificationStatus: string;
  publicationStatus: string;
};

const EMPTY: ProgramFormValues = {
  name: "",
  slug: "",
  credentialType: "DEGREE",
  durationLabel: "",
  deliveryMode: "IN_PERSON",
  admissionNotes: "",
  tuitionNote: "",
  verificationStatus: "POC_SEED",
  publicationStatus: "PUBLISHED",
};

export function ProgramFormDialog({
  mode,
  programId,
  defaults,
}: {
  mode: "create" | "edit";
  programId?: string;
  defaults?: ProgramFormValues;
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
  } = useForm<ProgramFormValues>({ defaultValues: defaults ?? EMPTY });

  async function onSubmit(values: ProgramFormValues) {
    setServerError(null);
    const url = mode === "create" ? "/api/admin/programs" : `/api/admin/programs/${programId}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        admissionNotes: values.admissionNotes || null,
        tuitionNote: values.tuitionNote || null,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      if (body?.error?.fieldErrors) {
        for (const [field, messages] of Object.entries(body.error.fieldErrors as Record<string, string[]>)) {
          setError(field as keyof ProgramFormValues, { message: messages[0] });
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
            <Plus className="h-4 w-4" /> New program
          </Button>
        ) : (
          <Button size="sm" variant="ghost">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New program" : "Edit program"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="prog-name">Name</Label>
              <Input id="prog-name" {...register("name", { required: true })} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message ?? "Required."}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prog-slug">Slug</Label>
              <Input id="prog-slug" {...register("slug", { required: true })} />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message ?? "Required."}</p>}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Credential type</Label>
              <Select value={watch("credentialType")} onValueChange={(v) => setValue("credentialType", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CREDENTIAL_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {formatCredentialType(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prog-durationLabel">Duration label</Label>
              <Input id="prog-durationLabel" placeholder="e.g. 4 years" {...register("durationLabel", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Delivery mode</Label>
              <Select value={watch("deliveryMode")} onValueChange={(v) => setValue("deliveryMode", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERY_MODES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {formatDeliveryMode(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prog-admissionNotes">Admission notes (optional)</Label>
            <Textarea id="prog-admissionNotes" rows={2} {...register("admissionNotes")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prog-tuitionNote">Tuition note (optional)</Label>
            <Input id="prog-tuitionNote" {...register("tuitionNote")} />
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
