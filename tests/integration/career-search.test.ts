import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { searchCareers } from "@/lib/search/careers";
import { careerSearchQuerySchema } from "@/lib/validations/careers";

const SLUG_PREFIX = "test-search-";

async function makeCareer(opts: {
  slug: string;
  title: string;
  industryId: string;
  categoryId: string;
  educationLevel?: "HIGH_SCHOOL" | "BACHELORS";
  salaryMin?: number;
  salaryMax?: number;
}) {
  return prisma.career.create({
    data: {
      slug: opts.slug,
      title: opts.title,
      shortDescription: `${opts.title} short description`,
      longDescription: `${opts.title} long description`,
      primaryIndustryId: opts.industryId,
      primaryCategoryId: opts.categoryId,
      responsibilities: ["Do the work."],
      goodFitIf: ["You like this."],
      challengingIf: ["You dislike that."],
      workEnvironment: "Office-based.",
      educationLevel: opts.educationLevel ?? "BACHELORS",
      entryDifficulty: "MODERATE",
      timeToEntryMinMonths: 6,
      timeToEntryMaxMonths: 12,
      remoteViability: "HIGH",
      freelanceViability: "MODERATE",
      publicationStatus: "PUBLISHED",
      verificationStatus: "POC_SEED",
      metrics: opts.salaryMin
        ? {
            create: [
              {
                metricType: "SALARY",
                salaryMin: opts.salaryMin,
                salaryMax: opts.salaryMax,
                status: "POC_ESTIMATE",
              },
            ],
          }
        : undefined,
    },
  });
}

describe("searchCareers (integration)", () => {
  let industryId: string;
  let categoryId: string;

  beforeAll(async () => {
    const industry = await prisma.industry.create({
      data: { slug: `${SLUG_PREFIX}industry`, name: "Test Industry", description: "Fixture industry", publicationStatus: "PUBLISHED" },
    });
    industryId = industry.id;
    const category = await prisma.careerCategory.create({
      data: { slug: `${SLUG_PREFIX}category`, name: "Test Category", description: "Fixture category", industryId, publicationStatus: "PUBLISHED" },
    });
    categoryId = category.id;

    await makeCareer({ slug: `${SLUG_PREFIX}alpha`, title: "Search Test Alpha Analyst", industryId, categoryId, salaryMin: 20000, salaryMax: 30000 });
    await makeCareer({ slug: `${SLUG_PREFIX}beta`, title: "Search Test Beta Engineer", industryId, categoryId, educationLevel: "HIGH_SCHOOL", salaryMin: 60000, salaryMax: 90000 });
    await makeCareer({ slug: `${SLUG_PREFIX}gamma`, title: "Unrelated Gamma Role", industryId, categoryId });
  });

  afterAll(async () => {
    await prisma.career.deleteMany({ where: { slug: { startsWith: SLUG_PREFIX } } });
    await prisma.careerCategory.deleteMany({ where: { slug: `${SLUG_PREFIX}category` } });
    await prisma.industry.deleteMany({ where: { slug: `${SLUG_PREFIX}industry` } });
  });

  it("finds careers by a partial, case-insensitive title match", async () => {
    const query = careerSearchQuerySchema.parse({ q: "alpha analyst" });
    const result = await searchCareers(query);
    expect(result.items.some((c) => c.slug === `${SLUG_PREFIX}alpha`)).toBe(true);
    expect(result.items.some((c) => c.slug === `${SLUG_PREFIX}gamma`)).toBe(false);
  });

  it("filters by education level", async () => {
    const query = careerSearchQuerySchema.parse({ educationLevel: ["HIGH_SCHOOL"], q: "Search Test" });
    const result = await searchCareers(query);
    const slugs = result.items.map((c) => c.slug);
    expect(slugs).toContain(`${SLUG_PREFIX}beta`);
    expect(slugs).not.toContain(`${SLUG_PREFIX}alpha`);
  });

  it("filters by salary band overlap", async () => {
    const query = careerSearchQuerySchema.parse({ salaryMin: 50000, q: "Search Test" });
    const result = await searchCareers(query);
    const slugs = result.items.map((c) => c.slug);
    expect(slugs).toContain(`${SLUG_PREFIX}beta`);
    expect(slugs).not.toContain(`${SLUG_PREFIX}alpha`);
  });

  it("paginates results", async () => {
    const query = careerSearchQuerySchema.parse({ q: "Search Test", pageSize: 1, page: 1 });
    const result = await searchCareers(query);
    expect(result.items).toHaveLength(1);
    expect(result.totalPages).toBeGreaterThanOrEqual(2);
  });

  it("returns an empty result set for a query that matches nothing", async () => {
    const query = careerSearchQuerySchema.parse({ q: "zzz-no-such-career-zzz" });
    const result = await searchCareers(query);
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
