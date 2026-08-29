import { Badge } from "@/components/ui/badge";
import { formatVerificationStatus } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const VARIANTS: Record<string, "muted" | "warning" | "success" | "outline"> = {
  POC_SEED: "muted",
  UNVERIFIED: "outline",
  NEEDS_REVIEW: "warning",
  VERIFIED: "success",
  ARCHIVED: "outline",
};

export function VerificationBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant={VARIANTS[status] ?? "outline"} className={cn("shrink-0", className)}>
      {formatVerificationStatus(status)}
    </Badge>
  );
}
