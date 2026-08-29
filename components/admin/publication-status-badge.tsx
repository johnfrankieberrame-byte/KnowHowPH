import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

const VARIANTS: Record<string, "muted" | "success" | "outline"> = {
  DRAFT: "muted",
  PUBLISHED: "success",
  ARCHIVED: "outline",
};

export function PublicationStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant={VARIANTS[status] ?? "outline"} className={cn("shrink-0", className)}>
      {LABELS[status] ?? status}
    </Badge>
  );
}
