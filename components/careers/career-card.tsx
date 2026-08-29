import Link from "next/link";
import { ArrowUpRight, Wifi, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VerificationBadge } from "@/components/careers/verification-badge";
import { formatEducationLevel, formatRating, formatSalaryRange } from "@/lib/utils/format";

export interface CareerCardData {
  slug: string;
  title: string;
  shortDescription: string;
  educationLevel: string;
  verificationStatus: string;
  remoteViability: string;
  freelanceViability: string;
  primaryIndustry: { name: string; slug: string };
  primaryCategory: { name: string; slug: string };
  salary?: { min: number | null; max: number | null } | null;
  demand?: string | null;
}

export function CareerCard({
  career,
  compareControl,
}: {
  career: CareerCardData;
  compareControl?: { checked: boolean; disabled?: boolean; onToggle: () => void };
}) {
  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Badge variant="accent">{career.primaryIndustry.name}</Badge>
          <VerificationBadge status={career.verificationStatus} />
        </div>
        {compareControl && (
          <label className="flex w-fit items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={compareControl.checked}
              disabled={compareControl.disabled && !compareControl.checked}
              onChange={compareControl.onToggle}
              className="h-3.5 w-3.5 rounded border-input"
            />
            Compare
          </label>
        )}
        <CardTitle className="mt-1">
          <Link href={`/careers/${career.slug}`} className="hover:text-primary">
            {career.title}
            <ArrowUpRight className="ml-1 inline h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2">{career.shortDescription}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col gap-3 pt-0">
        <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <div>
            <dt className="font-medium text-foreground">Typical salary</dt>
            <dd>{career.salary ? formatSalaryRange(career.salary.min, career.salary.max) : "POC estimate pending"}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Demand</dt>
            <dd>{formatRating(career.demand)}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Education</dt>
            <dd>{formatEducationLevel(career.educationLevel)}</dd>
          </div>
          <div className="flex items-center gap-1">
            {career.remoteViability === "HIGH" || career.remoteViability === "VERY_HIGH" ? (
              <span className="inline-flex items-center gap-1">
                <Wifi className="h-3 w-3" /> Remote-friendly
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Briefcase className="h-3 w-3" /> Mostly on-site
              </span>
            )}
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
