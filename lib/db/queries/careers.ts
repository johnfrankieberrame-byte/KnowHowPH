import "server-only";
import { prisma } from "@/lib/db/prisma";

const careerDetailInclude = {
  primaryIndustry: true,
  primaryCategory: true,
  secondaryCategories: true,
  aliases: true,
  skills: { include: { skill: true }, orderBy: { proficiency: "asc" as const } },
  workStyleTags: { include: { tag: true } },
  pathways: { orderBy: { order: "asc" as const } },
  certifications: { include: { certification: true } },
  metrics: { include: { source: true } },
  sourceRefs: { include: { source: true } },
  relatedCareers: {
    where: { publicationStatus: "PUBLISHED" as const },
    include: { primaryIndustry: true, metrics: true },
  },
  programLinks: {
    include: {
      program: { include: { schoolPrograms: { include: { school: true } } } },
    },
  },
};

export async function getCareerBySlug(slug: string) {
  return prisma.career.findFirst({
    where: { slug, publicationStatus: "PUBLISHED" },
    include: careerDetailInclude,
  });
}

export async function getCareerBySlugForAdmin(id: string) {
  return prisma.career.findUnique({ where: { id }, include: careerDetailInclude });
}

export async function getFeaturedCareers(limit = 6) {
  return prisma.career.findMany({
    where: { publicationStatus: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      primaryIndustry: true,
      primaryCategory: true,
      metrics: true,
    },
  });
}

export async function getCareersBySlugs(slugs: string[]) {
  return prisma.career.findMany({
    where: { slug: { in: slugs }, publicationStatus: "PUBLISHED" },
    include: careerDetailInclude,
  });
}

export async function getAllCareerSlugs() {
  const careers = await prisma.career.findMany({
    where: { publicationStatus: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });
  return careers;
}

export async function getFilterOptions() {
  const [industries, categories, skills, workStyleTags] = await Promise.all([
    prisma.industry.findMany({ where: { publicationStatus: "PUBLISHED" }, orderBy: { order: "asc" } }),
    prisma.careerCategory.findMany({ where: { publicationStatus: "PUBLISHED" }, orderBy: { order: "asc" } }),
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
    prisma.workStyleTag.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { industries, categories, skills, workStyleTags };
}
