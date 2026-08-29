import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { CareerSearchQuery } from "@/lib/validations/careers";

const careerListInclude = {
  primaryIndustry: true,
  primaryCategory: true,
  workStyleTags: { include: { tag: true } },
  skills: { include: { skill: true } },
  metrics: true,
} satisfies Prisma.CareerInclude;

export type CareerListItem = Prisma.CareerGetPayload<{ include: typeof careerListInclude }>;

function relevanceScore(career: CareerListItem, q: string): number {
  const query = q.toLowerCase();
  let score = 0;
  const title = career.title.toLowerCase();
  if (title === query) score += 100;
  else if (title.startsWith(query)) score += 60;
  else if (title.includes(query)) score += 40;
  if (career.shortDescription.toLowerCase().includes(query)) score += 15;
  if (career.longDescription.toLowerCase().includes(query)) score += 5;
  if (career.primaryIndustry.name.toLowerCase().includes(query)) score += 10;
  if (career.primaryCategory.name.toLowerCase().includes(query)) score += 10;
  if (career.skills.some((s) => s.skill.name.toLowerCase().includes(query))) score += 8;
  if (career.workStyleTags.some((t) => t.tag.name.toLowerCase().includes(query))) score += 5;
  return score;
}

export interface CareerSearchResult {
  items: CareerListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Filters + (optionally) full-text-ish searches published careers.
 * Given the POC's small catalog size (dozens of rows), we fetch the filtered
 * set and sort/paginate in application code rather than a hand-rolled
 * Postgres tsvector pipeline — simpler, fully testable, and still a
 * Prisma-compatible search implementation as scale allows.
 */
export async function searchCareers(query: CareerSearchQuery): Promise<CareerSearchResult> {
  const where: Prisma.CareerWhereInput = {
    publicationStatus: "PUBLISHED",
  };

  if (query.industry?.length) where.primaryIndustry = { slug: { in: query.industry } };
  if (query.category?.length) where.primaryCategory = { slug: { in: query.category } };
  if (query.educationLevel?.length) where.educationLevel = { in: query.educationLevel };
  if (query.entryDifficulty?.length) where.entryDifficulty = { in: query.entryDifficulty };
  if (query.status?.length) where.verificationStatus = { in: query.status };
  if (query.remote?.length) where.remoteViability = { in: query.remote };
  if (query.freelance?.length) where.freelanceViability = { in: query.freelance };
  if (query.entryPathway?.length) where.pathways = { some: { type: { in: query.entryPathway } } };
  if (query.workStyleTag?.length) where.workStyleTags = { some: { tag: { slug: { in: query.workStyleTag } } } };
  if (query.skill?.length) where.skills = { some: { skill: { slug: { in: query.skill } } } };

  const metricConditions: Prisma.CareerMetricWhereInput[] = [];
  if (query.demand?.length) metricConditions.push({ metricType: "DEMAND", rating: { in: query.demand } });
  if (query.saturation?.length) metricConditions.push({ metricType: "SATURATION", rating: { in: query.saturation } });
  if (query.salaryMin != null || query.salaryMax != null) {
    metricConditions.push({
      metricType: "SALARY",
      ...(query.salaryMax != null ? { salaryMin: { lte: query.salaryMax } } : {}),
      ...(query.salaryMin != null ? { salaryMax: { gte: query.salaryMin } } : {}),
    });
  }
  if (metricConditions.length) {
    where.AND = metricConditions.map((m) => ({ metrics: { some: m } }));
  }

  if (query.q) {
    const q = query.q;
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
      { longDescription: { contains: q, mode: "insensitive" } },
      { aliases: { some: { alias: { contains: q, mode: "insensitive" } } } },
      { skills: { some: { skill: { name: { contains: q, mode: "insensitive" } } } } },
      { primaryIndustry: { name: { contains: q, mode: "insensitive" } } },
      { primaryCategory: { name: { contains: q, mode: "insensitive" } } },
      { workStyleTags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
    ];
  }

  const all = await prisma.career.findMany({ where, include: careerListInclude });

  let sorted = all;
  if (query.q && query.sort === "relevance") {
    sorted = [...all].sort((a, b) => relevanceScore(b, query.q!) - relevanceScore(a, query.q!));
  } else if (query.sort === "title_asc") {
    sorted = [...all].sort((a, b) => a.title.localeCompare(b.title));
  } else if (query.sort === "salary_desc") {
    sorted = [...all].sort((a, b) => salaryMidpoint(b) - salaryMidpoint(a));
  } else if (query.sort === "demand_desc") {
    sorted = [...all].sort((a, b) => ratingRank(b, "DEMAND") - ratingRank(a, "DEMAND"));
  } else if (query.sort === "newest") {
    sorted = [...all].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * query.pageSize;
  const items = sorted.slice(start, start + query.pageSize);

  return { items, total, page, pageSize: query.pageSize, totalPages };
}

function salaryMidpoint(career: CareerListItem): number {
  const metric = career.metrics.find((m) => m.metricType === "SALARY");
  if (!metric?.salaryMin || !metric.salaryMax) return 0;
  return (metric.salaryMin + metric.salaryMax) / 2;
}

const RATING_ORDER = ["VERY_LOW", "LOW", "MODERATE", "HIGH", "VERY_HIGH"];
function ratingRank(career: CareerListItem, type: "DEMAND" | "SATURATION"): number {
  const metric = career.metrics.find((m) => m.metricType === type);
  if (!metric?.rating) return -1;
  return RATING_ORDER.indexOf(metric.rating);
}
