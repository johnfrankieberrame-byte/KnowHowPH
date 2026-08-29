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
import { formatPublicationStatus } from "@/lib/utils/format";

const PUBLICATION_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export type IndustryFormValues = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  publicationStatus: string;
};

const EMPTY: IndustryFormValues = { name: "", slug: "", description: "", icon: "", order: 0, publicationStatus: "PUBLISHED" };

export function IndustryFormDialog({
  mode,
  industryId,
  defaults,
}: {
  mode: "create" | "edit";
  industryId?: string;
  defaults?: IndustryFormValues;
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
  } = useForm<IndustryFormValues>({ defaultValues: defaults ?? EMPTY });

  async function onSubmit(values: IndustryFormValues) {
    setServerError(null);
    const url = mode === "create" ? "/api/admin/industries" : `/api/admin/industries/${industryId}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, order: Number(values.order), icon: values.icon || null }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      if (body?.error?.fieldErrors) {
        for (const [field, messages] of Object.entries(body.error.fieldErrors as Record<string, string[]>)) {
          setError(field as keyof IndustryFormValues, { message: messages[0] });
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
            <Plus className="h-4 w-4" /> New industry
          </Button>
        ) : (
          <Button size="sm" variant="ghost">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New industry" : "Edit industry"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ind-name">Name</Label>
              <Input id="ind-name" {...register("name", { required: true })} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message ?? "Required."}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ind-slug">Slug</Label>
              <Input id="ind-slug" {...register("slug", { required: true })} />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message ?? "Required."}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ind-description">Description</Label>
            <Textarea id="ind-description" rows={3} {...register("description", { required: true })} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="ind-icon">Icon name (optional)</Label>
              <Input id="ind-icon" {...register("icon")} placeholder="lucide icon name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ind-order">Order</Label>
              <Input id="ind-order" type="number" {...register("order", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
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
