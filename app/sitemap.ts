import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${appUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${appUrl}/careers`, changeFrequency: "daily", priority: 0.9 },
    { url: `${appUrl}/industries`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${appUrl}/schools`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${appUrl}/quiz`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${appUrl}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${appUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${appUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const [careers, industries, categories, schools, programs] = await Promise.all([
    prisma.career.findMany({ where: { publicationStatus: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.industry.findMany({ where: { publicationStatus: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.careerCategory.findMany({ where: { publicationStatus: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.school.findMany({ where: { publicationStatus: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.program.findMany({ where: { publicationStatus: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
  ]);

  return [
    ...staticRoutes,
    ...careers.map((c) => ({ url: `${appUrl}/careers/${c.slug}`, lastModified: c.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...industries.map((i) => ({ url: `${appUrl}/industries/${i.slug}`, lastModified: i.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...categories.map((c) => ({ url: `${appUrl}/categories/${c.slug}`, lastModified: c.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...schools.map((s) => ({ url: `${appUrl}/schools/${s.slug}`, lastModified: s.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...programs.map((p) => ({ url: `${appUrl}/programs/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.4 })),
  ];
}
