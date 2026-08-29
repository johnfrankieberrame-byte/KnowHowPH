import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getIndustryBySlug } from "@/lib/db/queries/industries";
import { CareerCard } from "@/components/careers/career-card";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) return {};
  return {
    title: industry.name,
    description: industry.description,
    alternates: { canonical: `/industries/${industry.slug}` },
  };
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) notFound();

  const allCareers = industry.categories.flatMap((cat) => cat.primaryCareers.map((c) => ({ ...c, categoryName: cat.name, categorySlug: cat.slug })));

  return (
    <div className="container-page py-10">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/industries" className="hover:text-primary">Industries</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span aria-current="page" className="text-foreground">{industry.name}</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight">{industry.name}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{industry.description}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {industry.categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="rounded-full border border-border px-3 py-1 text-sm hover:border-primary hover:text-primary"
          >
            {cat.name} ({cat.primaryCareers.length})
          </Link>
        ))}
      </div>

      {allCareers.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No published careers in this industry yet.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {allCareers.map((c) => (
            <CareerCard
              key={c.id}
              career={{
                slug: c.slug,
                title: c.title,
                shortDescription: c.shortDescription,
                educationLevel: c.educationLevel,
                verificationStatus: c.verificationStatus,
                remoteViability: c.remoteViability,
                freelanceViability: c.freelanceViability,
                primaryIndustry: { name: industry.name, slug: industry.slug },
                primaryCategory: { name: c.categoryName, slug: c.categorySlug },
                salary: (() => {
                  const m = c.metrics.find((x) => x.metricType === "SALARY");
                  return m ? { min: m.salaryMin, max: m.salaryMax } : null;
                })(),
                demand: c.metrics.find((x) => x.metricType === "DEMAND")?.rating ?? null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
