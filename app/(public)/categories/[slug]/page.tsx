import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getCategoryBySlug } from "@/lib/db/queries/industries";
import { CareerCard } from "@/components/careers/career-card";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/categories/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <div className="container-page py-10">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/industries" className="hover:text-primary">Industries</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/industries/${category.industry.slug}`} className="hover:text-primary">{category.industry.name}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span aria-current="page" className="text-foreground">{category.name}</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{category.description}</p>

      {category.primaryCareers.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No published careers in this category yet.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {category.primaryCareers.map((c) => (
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
                primaryIndustry: c.primaryIndustry,
                primaryCategory: c.primaryCategory,
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
