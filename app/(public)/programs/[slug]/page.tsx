import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Building2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { VerificationBadge } from "@/components/careers/verification-badge";
import { getProgramBySlug } from "@/lib/db/queries/schools";
import { formatCredentialType, formatDeliveryMode } from "@/lib/utils/format";

interface ProgramPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProgramPageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) return { title: "Program not found" };

  return {
    title: program.name,
    description: `${formatCredentialType(program.credentialType)} · ${program.durationLabel} · ${formatDeliveryMode(program.deliveryMode)}`,
    alternates: { canonical: `/programs/${program.slug}` },
  };
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  return (
    <div className="container-page max-w-4xl py-12">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">{formatCredentialType(program.credentialType)}</Badge>
          <Badge variant="outline">{formatDeliveryMode(program.deliveryMode)}</Badge>
          <VerificationBadge status={program.verificationStatus} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{program.name}</h1>
        <p className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0" aria-hidden />
          {program.durationLabel}
        </p>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {program.admissionNotes && (
          <div>
            <dt className="text-sm font-medium text-foreground">Admission notes</dt>
            <dd className="mt-1 text-sm text-muted-foreground">{program.admissionNotes}</dd>
          </div>
        )}
        {program.tuitionNote && (
          <div>
            <dt className="text-sm font-medium text-foreground">Tuition (estimate)</dt>
            <dd className="mt-1 text-sm text-muted-foreground">{program.tuitionNote}</dd>
          </div>
        )}
      </dl>

      <Separator className="my-10" />

      <section>
        <h2 className="text-xl font-semibold">Schools offering this program</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {program.schoolPrograms.length === 0
            ? "No schools are listed as offering this program yet."
            : `${program.schoolPrograms.length} school${program.schoolPrograms.length === 1 ? "" : "s"} in our catalog.`}
        </p>

        {program.schoolPrograms.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {program.schoolPrograms.map(({ id, school, tuitionNoteOverride }) => (
              <Card key={id} className="flex h-full flex-col">
                <CardHeader>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {school.provinceCity}, {school.region}
                  </div>
                  <CardTitle className="text-base">
                    <Link href={`/schools/${school.slug}`} className="hover:text-primary">
                      {school.name}
                      <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </CardTitle>
                  {tuitionNoteOverride && (
                    <CardDescription>Tuition (estimate): {tuitionNoteOverride}</CardDescription>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Separator className="my-10" />

      <section>
        <h2 className="text-xl font-semibold">Related careers</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {program.programCareers.length === 0
            ? "No related careers are linked to this program yet."
            : "Careers this program can help prepare you for."}
        </p>

        {program.programCareers.length > 0 && (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {program.programCareers.map(({ id, career, relevanceNote }) => (
              <li key={id}>
                <Link
                  href={`/careers/${career.slug}`}
                  className="block rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <span className="font-medium hover:text-primary">
                    {career.title}
                    <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" aria-hidden />
                  </span>
                  {career.shortDescription && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{career.shortDescription}</p>
                  )}
                  {relevanceNote && <p className="mt-1 text-xs text-muted-foreground">{relevanceNote}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-12">
        <Alert variant="info">
          <AlertTitle>How to read this listing</AlertTitle>
          <AlertDescription>
            This program record may be clearly-labeled demo / proof-of-concept data used to illustrate the
            product experience. Tuition figures are informational estimates, not official fee schedules —
            do not treat this page as proof of current availability. Always confirm program details,
            tuition, and admission requirements directly with the offering school before applying.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
