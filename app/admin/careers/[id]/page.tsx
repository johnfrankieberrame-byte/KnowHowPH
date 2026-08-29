import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PublicationStatusBadge } from "@/components/admin/publication-status-badge";
import { VerificationBadge } from "@/components/careers/verification-badge";
import { CareerCoreForm, type CareerFormDefaults } from "@/components/admin/career-core-form";
import { CareerMetricsPanel } from "@/components/admin/career-metrics-panel";
import { CareerSourcesPanel } from "@/components/admin/career-sources-panel";
import { CareerQuizProfilePanel } from "@/components/admin/career-quiz-profile-panel";
import { CareerStatusPanel } from "@/components/admin/career-status-panel";
import { getCareerBySlugForAdmin } from "@/lib/db/queries/careers";
import {
  getAllIndustriesForAdmin,
  getAllCategoriesForAdmin,
  getAllSourcesForAdmin,
  getCareerQuizProfileForAdmin,
} from "@/lib/db/queries/admin";
import type { TraitKey, ConstraintKey } from "@/lib/quiz/traits";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const career = await getCareerBySlugForAdmin(id);
  return { title: career ? career.title : "Career" };
}

export default async function AdminCareerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [career, industries, categories, sources, quizProfile] = await Promise.all([
    getCareerBySlugForAdmin(id),
    getAllIndustriesForAdmin(),
    getAllCategoriesForAdmin(),
    getAllSourcesForAdmin(),
    getCareerQuizProfileForAdmin(id),
  ]);

  if (!career) notFound();

  const defaults: CareerFormDefaults = {
    title: career.title,
    slug: career.slug,
    shortDescription: career.shortDescription,
    longDescription: career.longDescription,
    primaryIndustryId: career.primaryIndustryId,
    primaryCategoryId: career.primaryCategoryId,
    responsibilities: career.responsibilities,
    goodFitIf: career.goodFitIf,
    challengingIf: career.challengingIf,
    workEnvironment: career.workEnvironment,
    workStyleSummary: career.workStyleSummary ?? "",
    educationLevel: career.educationLevel,
    entryDifficulty: career.entryDifficulty,
    timeToEntryMinMonths: career.timeToEntryMinMonths,
    timeToEntryMaxMonths: career.timeToEntryMaxMonths,
    remoteViability: career.remoteViability,
    freelanceViability: career.freelanceViability,
    entryLevelTitle: career.entryLevelTitle ?? "",
    midLevelTitle: career.midLevelTitle ?? "",
    seniorLevelTitle: career.seniorLevelTitle ?? "",
    seoTitle: career.seoTitle ?? "",
    seoDescription: career.seoDescription ?? "",
    publicationStatus: career.publicationStatus,
    verificationStatus: career.verificationStatus,
  };

  return (
    <div className="max-w-4xl">
      <Link href="/admin/careers" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to careers
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{career.title}</h1>
        <PublicationStatusBadge status={career.publicationStatus} />
        <VerificationBadge status={career.verificationStatus} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {career.primaryIndustry.name} · {career.primaryCategory.name} · /careers/{career.slug}
      </p>

      <Tabs defaultValue="details" className="mt-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="quiz-profile">Quiz profile</TabsTrigger>
          <TabsTrigger value="status">Publish & review</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <CareerCoreForm
            mode="edit"
            careerId={career.id}
            defaults={defaults}
            industries={industries.map((i) => ({ id: i.id, name: i.name }))}
            categories={categories.map((c) => ({ id: c.id, name: c.name, industryId: c.industryId }))}
          />
        </TabsContent>

        <TabsContent value="metrics">
          <CareerMetricsPanel
            careerId={career.id}
            metrics={career.metrics.map((m) => ({
              id: m.id,
              metricType: m.metricType,
              salaryMin: m.salaryMin,
              salaryMax: m.salaryMax,
              currency: m.currency,
              rating: m.rating,
              status: m.status,
              periodLabel: m.periodLabel,
              methodologyNote: m.methodologyNote,
              sourceId: m.sourceId,
              source: m.source ? { id: m.source.id, title: m.source.title } : null,
            }))}
            sources={sources.map((s) => ({ id: s.id, title: s.title }))}
          />
        </TabsContent>

        <TabsContent value="sources">
          <CareerSourcesPanel
            careerId={career.id}
            references={career.sourceRefs.map((ref) => ({
              id: ref.id,
              fieldContext: ref.fieldContext,
              note: ref.note,
              source: {
                id: ref.source.id,
                title: ref.source.title,
                publisher: ref.source.publisher,
                url: ref.source.url,
                verificationStatus: ref.source.verificationStatus,
              },
            }))}
            availableSources={sources.map((s) => ({ id: s.id, title: s.title, publisher: s.publisher }))}
          />
        </TabsContent>

        <TabsContent value="quiz-profile">
          <CareerQuizProfilePanel
            careerId={career.id}
            hasProfile={Boolean(quizProfile)}
            defaults={{
              idealTraits: (quizProfile?.idealTraits as Partial<Record<TraitKey, number>>) ?? {},
              traitWeights: (quizProfile?.traitWeights as Partial<Record<TraitKey, number>>) ?? {},
              hardConstraints: (quizProfile?.hardConstraints as ConstraintKey[] | null) ?? [],
              calculationVersion: quizProfile?.calculationVersion ?? 1,
            }}
          />
        </TabsContent>

        <TabsContent value="status">
          <CareerStatusPanel
            careerId={career.id}
            publicationStatus={career.publicationStatus}
            verificationStatus={career.verificationStatus}
            lastReviewedAt={career.lastReviewedAt}
            nextReviewDueAt={career.nextReviewDueAt}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const dynamic = "force-dynamic";
