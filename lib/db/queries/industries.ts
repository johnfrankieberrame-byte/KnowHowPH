import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getPublishedIndustries() {
  return prisma.industry.findMany({
    where: { publicationStatus: "PUBLISHED" },
    orderBy: { order: "asc" },
    include: {
      _count: { select: { primaryCareers: { where: { publicationStatus: "PUBLISHED" } } } },
      categories: {
        where: { publicationStatus: "PUBLISHED" },
        orderBy: { order: "asc" },
        include: { _count: { select: { primaryCareers: { where: { publicationStatus: "PUBLISHED" } } } } },
      },
    },
  });
}

export async function getIndustryBySlug(slug: string) {
  return prisma.industry.findFirst({
    where: { slug, publicationStatus: "PUBLISHED" },
    include: {
      categories: {
        where: { publicationStatus: "PUBLISHED" },
        orderBy: { order: "asc" },
        include: {
          primaryCareers: {
            where: { publicationStatus: "PUBLISHED" },
            orderBy: { title: "asc" },
            include: { metrics: true },
          },
        },
      },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.careerCategory.findFirst({
    where: { slug, publicationStatus: "PUBLISHED" },
    include: {
      industry: true,
      primaryCareers: {
        where: { publicationStatus: "PUBLISHED" },
        orderBy: { title: "asc" },
        include: { metrics: true, primaryIndustry: true, primaryCategory: true },
      },
    },
  });
}
