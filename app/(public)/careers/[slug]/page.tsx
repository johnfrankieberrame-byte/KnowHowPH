import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, AlertCircle, GraduationCap, MapPin, ChevronRight } from "lucide-react";
import { getCareerBySlug, getAllCareerSlugs } from "@/lib/db/queries/careers";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VerificationBadge } from "@/components/careers/verification-badge";
import { AtAGlance } from "@/components/careers/at-a-glance";
import { SourcePanel } from "@/components/careers/source-panel";
import { SaveCareerButton } from "@/components/careers/save-career-button";
import { CareerCard } from "@/components/careers/career-card";
import { formatMonthsRange } from "@/lib/utils/format";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllCareerSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const career = await getCareerBySlug(slug);
  if (!career) return {};
  return {
    title: career.seoTitle || career.title,
    description: career.seoDescription || career.shortDescription,
    alternates: { canonical: `/careers/${career.slug}` },
    openGraph: {
      title: career.seoTitle || career.title,
      description: career.seoDescription || career.shortDescription,
      type: "article",
    },
  };
}

const PATHWAY_LABELS: Record<string, string> = {
  DEGREE: "Degree route",
  TESDA: "TESDA route",
  CERTIFICATION: "Certification",
  BOOTCAMP: "Bootcamp",
  SELF_STUDY: "Self-study / portfolio",
  APPRENTICESHIP: "Apprenticeship",
  PORTFOLIO: "Portfolio-based",
  LICENSURE: "Licensure",
};

export default async function CareerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const career = await getCareerBySlug(slug);
  if (!career) notFound();

  const user = await getCurrentUser().catch(() => null);
  const isSaved = user
    ? Boolean(await prisma.savedCareer.findUnique({ where: { userId_careerId: { userId: user.id, careerId: career.id } } }))
    : false;

  const salaryMetric = career.metrics.find((m) => m.metricType === "SALARY");
  const demandMetric = career.metrics.find((m) => m.metricType === "DEMAND");
  const saturationMetric = career.metrics.find((m) => m.metricType === "SATURATION");

  const technicalSkills = career.skills.filter((s) => s.skill.category === "TECHNICAL");
  const humanSkills = career.skills.filter((s) => s.skill.category === "HUMAN");

  const programs = career.programLinks.map((pl) => pl.program);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Occupation",
    name: career.title,
    description: career.shortDescription,
    occupationLocation: { "@type": "Country", name: "Philippines" },
    ...(salaryMetric?.salaryMin && salaryMetric?.salaryMax
      ? {
          estimatedSalary: {
            "@type": "MonetaryAmountDistribution",
            currency: "PHP",
            duration: "P1M",
            percentile10: salaryMetric.salaryMin,
            percentile90: salaryMetric.salaryMax,
            name: `Illustrative ${salaryMetric.status === "POC_ESTIMATE" ? "POC estimate" : salaryMetric.status.toLowerCase()}, not verified live labor-market data`,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Careers", item: "/careers" },
      { "@type": "ListItem", position: 2, name: career.primaryIndustry.name, item: `/industries/${career.primaryIndustry.slug}` },
      { "@type": "ListItem", position: 3, name: career.title, item: `/careers/${career.slug}` },
    ],
  };

  return (
    <div className="container-page max-w-5xl py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/careers" className="hover:text-primary">Careers</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/industries/${career.primaryIndustry.slug}`} className="hover:text-primary">
          {career.primaryIndustry.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/categories/${career.primaryCategory.slug}`} className="hover:text-primary">
          {career.primaryCategory.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span aria-current="page" className="text-foreground">{career.title}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{career.primaryIndustry.name}</Badge>
            <VerificationBadge status={career.verificationStatus} />
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{career.title}</h1>
          <p className="mt-2 max-w-2xl text-lg text-muted-foreground">{career.shortDescription}</p>
          {career.aliases.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Also known as: {career.aliases.map((a) => a.alias).join(", ")}
            </p>
          )}
        </div>
        <SaveCareerButton careerId={career.id} careerSlug={career.slug} isSignedIn={Boolean(user)} initiallySaved={isSaved} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-semibold">Overview</h2>
            <p className="mt-2 text-muted-foreground">{career.longDescription}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">What you do</h2>
            <ul className="mt-3 space-y-2">
              {career.responsibilities.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Skills</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Technical skills</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {technicalSkills.map((cs) => (
                    <Badge key={cs.id} variant={cs.proficiency === "ADVANCED" ? "default" : "outline"}>
                      {cs.skill.name}
                      {cs.proficiency === "ADVANCED" && " (advanced)"}
                    </Badge>
                  ))}
                  {technicalSkills.length === 0 && <p className="text-sm text-muted-foreground">Not documented yet.</p>}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Human / transferable skills</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {humanSkills.map((cs) => (
                    <Badge key={cs.id} variant={cs.proficiency === "ADVANCED" ? "secondary" : "outline"}>
                      {cs.skill.name}
                    </Badge>
                  ))}
                  {humanSkills.length === 0 && <p className="text-sm text-muted-foreground">Not documented yet.</p>}
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Work environment & style</h2>
            <p className="mt-2 text-muted-foreground">{career.workEnvironment}</p>
            {career.workStyleTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {career.workStyleTags.map((t) => (
                  <Badge key={t.id} variant="muted">{t.tag.name}</Badge>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <GraduationCap className="h-5 w-5 text-primary" /> Education & qualification pathways
            </h2>
            <div className="mt-3 space-y-3">
              {career.pathways.map((p) => (
                <div key={p.id} className="rounded-md border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">
                      {PATHWAY_LABELS[p.type] ?? p.type}: {p.title}
                    </p>
                    {p.isRequired && <Badge variant="warning">Typically required</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                  {p.typicalDurationMonths && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Typical duration: {formatMonthsRange(p.typicalDurationMonths, p.typicalDurationMonths)}
                    </p>
                  )}
                </div>
              ))}
              {career.pathways.length === 0 && <p className="text-sm text-muted-foreground">Not documented yet.</p>}
            </div>
            {career.certifications.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground">Certifications / licensure</h3>
                <ul className="mt-2 space-y-1">
                  {career.certifications.map((cc) => (
                    <li key={cc.id} className="text-sm">
                      <span className="font-medium">{cc.certification.name}</span> — {cc.certification.issuingBody}
                      {cc.isRequired && <Badge variant="warning" className="ml-2">Required</Badge>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {programs.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold">Suggested schools & programs</h2>
              <div className="mt-3 space-y-2">
                {programs.map((program) => (
                  <Link
                    key={program.id}
                    href={`/programs/${program.slug}`}
                    className="flex items-center justify-between rounded-md border border-border p-3 text-sm hover:border-primary"
                  >
                    <span>
                      <span className="font-medium">{program.name}</span>{" "}
                      <span className="text-muted-foreground">
                        · offered at {program.schoolPrograms.map((sp) => sp.school.name).join(", ") || "select providers"}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-xl font-semibold">Career progression</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Entry level", value: career.entryLevelTitle },
                { label: "Mid level", value: career.midLevelTitle },
                { label: "Senior / specialist", value: career.seniorLevelTitle },
              ].map((row) => (
                <div key={row.label} className="rounded-md border border-border p-3">
                  <p className="text-xs font-medium text-muted-foreground">{row.label}</p>
                  <p className="mt-1 text-sm font-semibold">{row.value ?? "Varies"}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-success/30 bg-success/5 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-success">
                <CheckCircle2 className="h-4 w-4" /> Good fit if…
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {career.goodFitIf.map((item, i) => <li key={i}>• {item}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-warning">
                <AlertCircle className="h-4 w-4" /> May be challenging if…
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {career.challengingIf.map((item, i) => <li key={i}>• {item}</li>)}
              </ul>
            </div>
          </section>

          <SourcePanel references={career.sourceRefs} />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <AtAGlance
            data={{
              salary: salaryMetric ? { min: salaryMetric.salaryMin, max: salaryMetric.salaryMax, status: salaryMetric.status } : null,
              demand: demandMetric?.rating,
              saturation: saturationMetric?.rating,
              remoteViability: career.remoteViability,
              freelanceViability: career.freelanceViability,
              educationLevel: career.educationLevel,
              timeToEntryMinMonths: career.timeToEntryMinMonths,
              timeToEntryMaxMonths: career.timeToEntryMaxMonths,
            }}
          />
          {career.relatedCareers.length > 0 && (
            <Card>
              <CardHeader className="flex-row items-center gap-2 space-y-0">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Related careers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {career.relatedCareers.map((rc) => (
                  <Link key={rc.id} href={`/careers/${rc.slug}`} className="block rounded-md border border-border p-2 text-sm hover:border-primary">
                    <p className="font-medium">{rc.title}</p>
                    <p className="text-xs text-muted-foreground">{rc.primaryIndustry.name}</p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>

      {career.relatedCareers.length > 0 && (
        <>
          <Separator className="my-12" />
          <section>
            <h2 className="text-2xl font-bold tracking-tight">Related careers</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {career.relatedCareers.slice(0, 3).map((rc) => (
                <CareerCard
                  key={rc.id}
                  career={{
                    slug: rc.slug,
                    title: rc.title,
                    shortDescription: rc.shortDescription,
                    educationLevel: rc.educationLevel,
                    verificationStatus: rc.verificationStatus,
                    remoteViability: rc.remoteViability,
                    freelanceViability: rc.freelanceViability,
                    primaryIndustry: { name: rc.primaryIndustry.name, slug: rc.primaryIndustry.slug },
                    primaryCategory: { name: "", slug: "" },
                    salary: (() => {
                      const m = rc.metrics.find((x) => x.metricType === "SALARY");
                      return m ? { min: m.salaryMin, max: m.salaryMax } : null;
                    })(),
                    demand: rc.metrics.find((x) => x.metricType === "DEMAND")?.rating ?? null,
                  }}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
