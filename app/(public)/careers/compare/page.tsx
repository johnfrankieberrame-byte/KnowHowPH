import type { Metadata } from "next";
import Link from "next/link";
import { X } from "lucide-react";
import { compareQuerySchema } from "@/lib/validations/careers";
import { getCareersBySlugs } from "@/lib/db/queries/careers";
import { VerificationBadge } from "@/components/careers/verification-badge";
import { ComparePicker } from "@/components/careers/compare-picker";
import { formatEducationLevel, formatMonthsRange, formatRating, formatSalaryRange } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Compare careers",
  description: "Compare up to three Philippine career paths side by side — salary, demand, education, and more.",
  alternates: { canonical: "/careers/compare" },
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ slugs?: string }>;
}) {
  const sp = await searchParams;
  const parsed = sp.slugs ? compareQuerySchema.safeParse({ slugs: sp.slugs }) : null;
  const slugs = parsed?.success ? parsed.data.slugs.slice(0, 3) : [];
  const careers = slugs.length ? await getCareersBySlugs(slugs) : [];
  const ordered = slugs.map((s) => careers.find((c) => c.slug === s)).filter(Boolean) as typeof careers;

  const rows: { label: string; render: (c: (typeof ordered)[number]) => React.ReactNode }[] = [
    { label: "Industry", render: (c) => c.primaryIndustry.name },
    { label: "Category", render: (c) => c.primaryCategory.name },
    {
      label: "Typical salary",
      render: (c) => {
        const m = c.metrics.find((x) => x.metricType === "SALARY");
        return m ? formatSalaryRange(m.salaryMin, m.salaryMax) : "Not yet estimated";
      },
    },
    { label: "Demand", render: (c) => formatRating(c.metrics.find((x) => x.metricType === "DEMAND")?.rating) },
    { label: "Saturation", render: (c) => formatRating(c.metrics.find((x) => x.metricType === "SATURATION")?.rating) },
    { label: "Remote viability", render: (c) => formatRating(c.remoteViability) },
    { label: "Freelance viability", render: (c) => formatRating(c.freelanceViability) },
    { label: "Education level", render: (c) => formatEducationLevel(c.educationLevel) },
    { label: "Time to entry", render: (c) => formatMonthsRange(c.timeToEntryMinMonths, c.timeToEntryMaxMonths) },
    { label: "Entry difficulty", render: (c) => c.entryDifficulty.replace("_", " ") },
    {
      label: "Top skills",
      render: (c) => c.skills.slice(0, 4).map((s) => s.skill.name).join(", ") || "—",
    },
    { label: "Data status", render: (c) => <VerificationBadge status={c.verificationStatus} /> },
  ];

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold tracking-tight">Compare careers</h1>
      <p className="mt-1 text-muted-foreground">Compare up to three careers side by side. Figures are informational estimates.</p>

      <div className="mt-6">
        <ComparePicker currentSlugs={slugs} />
      </div>

      {ordered.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">No careers selected yet.</p>
          <Link href="/careers" className="mt-2 inline-block text-primary underline underline-offset-2">
            Browse careers to compare
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-40 border-b border-border p-3 text-left text-xs font-medium uppercase text-muted-foreground">
                  Attribute
                </th>
                {ordered.map((c) => (
                  <th key={c.id} className="border-b border-border p-3 text-left align-top">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/careers/${c.slug}`} className="font-semibold hover:text-primary">
                        {c.title}
                      </Link>
                      <Link
                        href={`/careers/compare?slugs=${slugs.filter((s) => s !== c.slug).join(",")}`}
                        aria-label={`Remove ${c.title} from comparison`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="odd:bg-muted/40">
                  <th scope="row" className="p-3 text-left text-xs font-medium text-muted-foreground">
                    {row.label}
                  </th>
                  {ordered.map((c) => (
                    <td key={c.id} className="p-3 align-top">
                      {row.render(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
