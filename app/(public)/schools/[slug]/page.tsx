import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ExternalLink, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { VerificationBadge } from "@/components/careers/verification-badge";
import { getSchoolBySlug } from "@/lib/db/queries/schools";
import { formatCredentialType, formatDeliveryMode, formatSchoolType } from "@/lib/utils/format";

interface SchoolPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SchoolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const school = await getSchoolBySlug(slug);
  if (!school) return { title: "School not found" };

  return {
    title: school.name,
    description: school.description.slice(0, 160),
    alternates: { canonical: `/schools/${school.slug}` },
  };
}

export default async function SchoolPage({ params }: SchoolPageProps) {
  const { slug } = await params;
  const school = await getSchoolBySlug(slug);
  if (!school) notFound();

  return (
    <div className="container-page max-w-4xl py-12">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">{formatSchoolType(school.type)}</Badge>
          <VerificationBadge status={school.verificationStatus} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{school.name}</h1>
        <p className="inline-flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          {school.provinceCity}, {school.region}
        </p>
        {school.website && (
          <a
            href={school.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Visit website <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        )}
      </div>

      <p className="mt-6 text-muted-foreground">{school.description}</p>

      {school.accreditationNote && (
        <div className="mt-4 rounded-md border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Accreditation note: </span>
          {school.accreditationNote}
        </div>
      )}

      <Separator className="my-10" />

      <section>
        <h2 className="text-xl font-semibold">Programs offered</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {school.schoolPrograms.length === 0
            ? "No programs are listed for this school yet."
            : `${school.schoolPrograms.length} program${school.schoolPrograms.length === 1 ? "" : "s"} in our catalog.`}
        </p>

        {school.schoolPrograms.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {school.schoolPrograms.map(({ id, program, tuitionNoteOverride, notes }) => {
              const tuitionNote = tuitionNoteOverride ?? program.tuitionNote;
              return (
                <Card key={id} className="flex h-full flex-col">
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{formatCredentialType(program.credentialType)}</Badge>
                      <Badge variant="outline">{formatDeliveryMode(program.deliveryMode)}</Badge>
                    </div>
                    <CardTitle className="text-base">
                      <Link href={`/programs/${program.slug}`} className="hover:text-primary">
                        {program.name}
                        <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </CardTitle>
                    <CardDescription>{program.durationLabel}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-1 pt-0 text-xs text-muted-foreground">
                    {tuitionNote && (
                      <p>
                        <span className="font-medium text-foreground">Tuition (estimate): </span>
                        {tuitionNote}
                      </p>
                    )}
                    {notes && <p>{notes}</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <div className="mt-12">
        <Alert variant="info">
          <AlertTitle>How to read this listing</AlertTitle>
          <AlertDescription>
            This school and program record may be clearly-labeled demo / proof-of-concept data used to
            illustrate the product experience. Tuition figures are informational estimates, not official
            fee schedules — do not treat this page as proof of current admissions availability. Always
            confirm program offerings, tuition, and admission requirements directly with the school before
            applying.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
