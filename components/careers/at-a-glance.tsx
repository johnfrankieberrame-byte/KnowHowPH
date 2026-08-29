import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerificationBadge } from "@/components/careers/verification-badge";
import {
  formatEducationLevel,
  formatMonthsRange,
  formatRating,
  formatSalaryRange,
} from "@/lib/utils/format";

export interface AtAGlanceData {
  salary?: { min: number | null; max: number | null; status: string } | null;
  demand?: string | null;
  saturation?: string | null;
  remoteViability: string;
  freelanceViability: string;
  educationLevel: string;
  timeToEntryMinMonths: number;
  timeToEntryMaxMonths: number;
}

export function AtAGlance({ data }: { data: AtAGlanceData }) {
  const rows: { label: string; value: React.ReactNode; badge?: React.ReactNode }[] = [
    {
      label: "Typical salary",
      value: data.salary ? formatSalaryRange(data.salary.min, data.salary.max) : "Not yet estimated",
      badge: data.salary && <VerificationBadge status={data.salary.status === "POC_ESTIMATE" ? "POC_SEED" : data.salary.status} />,
    },
    { label: "Market demand", value: formatRating(data.demand) },
    { label: "Saturation / competition", value: formatRating(data.saturation) },
    { label: "Remote viability", value: formatRating(data.remoteViability) },
    { label: "Freelance / self-employment viability", value: formatRating(data.freelanceViability) },
    { label: "Typical education level", value: formatEducationLevel(data.educationLevel) },
    {
      label: "Time to entry",
      value: formatMonthsRange(data.timeToEntryMinMonths, data.timeToEntryMaxMonths),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>At a glance</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-xs font-medium text-muted-foreground">{row.label}</dt>
              <dd className="mt-0.5 flex items-center gap-2 text-sm font-semibold">
                {row.value}
                {row.badge}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">
          Figures are informational estimates and may vary by city, employer, and experience. See the data & sources panel below for provenance.
        </p>
      </CardContent>
    </Card>
  );
}
