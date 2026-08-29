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

export type CategoryFormValues = {
  name: string;
  slug: string;
  description: string;
  industryId: string;
  order: number;
  publicationStatus: string;
};

export function CategoryFormDialog({
  mode,
  categoryId,
  defaults,
  industries,
}: {
  mode: "create" | "edit";
  categoryId?: string;
  defaults?: CategoryFormValues;
  industries: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const emptyDefaults: CategoryFormValues = {
    name: "",
    slug: "",
    description: "",
    industryId: industries[0]?.id ?? "",
    order: 0,
    publicationStatus: "PUBLISHED",
  };
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({ defaultValues: defaults ?? emptyDefaults });

  async function onSubmit(values: CategoryFormValues) {
    setServerError(null);
    const url = mode === "create" ? "/api/admin/categories" : `/api/admin/categories/${categoryId}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, order: Number(values.order) }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      if (body?.error?.fieldErrors) {
        for (const [field, messages] of Object.entries(body.error.fieldErrors as Record<string, string[]>)) {
          setError(field as keyof CategoryFormValues, { message: messages[0] });
        }
      }
      setServerError(body?.error?.message ?? "Something went wrong.");
      return;
    }
    setOpen(false);
    reset(defaults ?? emptyDefaults);
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
            <Plus className="h-4 w-4" /> New category
          </Button>
        ) : (
          <Button size="sm" variant="ghost">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New category" : "Edit category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name</Label>
              <Input id="cat-name" {...register("name", { required: true })} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message ?? "Required."}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input id="cat-slug" {...register("slug", { required: true })} />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message ?? "Required."}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-description">Description</Label>
            <Textarea id="cat-description" rows={3} {...register("description", { required: true })} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-1">
              <Label>Industry</Label>
              <Select value={watch("industryId")} onValueChange={(v) => setValue("industryId", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-order">Order</Label>
              <Input id="cat-order" type="number" {...register("order", { valueAsNumber: true })} />
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
