import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CareerCoreForm, type CareerFormDefaults } from "@/components/admin/career-core-form";
import { getAllIndustriesForAdmin, getAllCategoriesForAdmin } from "@/lib/db/queries/admin";

export const metadata: Metadata = { title: "New career" };

const EMPTY_DEFAULTS: CareerFormDefaults = {
  title: "",
  slug: "",
  shortDescription: "",
  longDescription: "",
  primaryIndustryId: "",
  primaryCategoryId: "",
  responsibilities: [],
  goodFitIf: [],
  challengingIf: [],
  workEnvironment: "",
  workStyleSummary: "",
  educationLevel: "VARIES",
  entryDifficulty: "MODERATE",
  timeToEntryMinMonths: 0,
  timeToEntryMaxMonths: 6,
  remoteViability: "MODERATE",
  freelanceViability: "MODERATE",
  entryLevelTitle: "",
  midLevelTitle: "",
  seniorLevelTitle: "",
  seoTitle: "",
  seoDescription: "",
  publicationStatus: "DRAFT",
  verificationStatus: "POC_SEED",
};

export default async function NewCareerPage() {
  const [industries, categories] = await Promise.all([getAllIndustriesForAdmin(), getAllCategoriesForAdmin()]);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/careers" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to careers
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">New career</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Create the core record first, then add metrics, sources, and the quiz-matching profile from the edit page.
      </p>

      <div className="mt-6">
        <CareerCoreForm
          mode="create"
          defaults={EMPTY_DEFAULTS}
          industries={industries.map((i) => ({ id: i.id, name: i.name }))}
          categories={categories.map((c) => ({ id: c.id, name: c.name, industryId: c.industryId }))}
        />
      </div>
    </div>
  );
}
