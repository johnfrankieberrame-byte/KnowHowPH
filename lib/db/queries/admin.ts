import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Prisma, PublicationStatus, VerificationStatus } from "@prisma/client";

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export async function getAdminDashboardCounts() {
  const [
    careersByPublication,
    careersByVerification,
    reviewQueueSize,
    industryCount,
    categoryCount,
    schoolCount,
    programCount,
    sourceCount,
    quizAttemptCount,
    quizResultCount,
  ] = await Promise.all([
    prisma.career.groupBy({ by: ["publicationStatus"], _count: { _all: true } }),
    prisma.career.groupBy({ by: ["verificationStatus"], _count: { _all: true } }),
    prisma.career.count({
      where: {
        OR: [
          { verificationStatus: { in: ["POC_SEED", "UNVERIFIED", "NEEDS_REVIEW"] } },
          { nextReviewDueAt: { lte: new Date() } },
        ],
      },
    }),
    prisma.industry.count(),
    prisma.careerCategory.count(),
    prisma.school.count(),
    prisma.program.count(),
    prisma.dataSource.count(),
    prisma.quizAttempt.count(),
    prisma.quizResult.count(),
  ]);

  const careersByPublicationStatus = Object.fromEntries(
    careersByPublication.map((row) => [row.publicationStatus, row._count._all])
  ) as Record<PublicationStatus, number>;

  const careersByVerificationStatus = Object.fromEntries(
    careersByVerification.map((row) => [row.verificationStatus, row._count._all])
  ) as Record<VerificationStatus, number>;

  return {
    careersByPublicationStatus,
    careersByVerificationStatus,
    totalCareers: careersByPublication.reduce((sum, r) => sum + r._count._all, 0),
    reviewQueueSize,
    industryCount,
    categoryCount,
    schoolCount,
    programCount,
    sourceCount,
    quizAttemptCount,
    quizResultCount,
  };
}

// ---------------------------------------------------------------------------
// Review queue
// ---------------------------------------------------------------------------

export type ReviewQueueItem = {
  id: string;
  type: "career" | "school" | "program";
  title: string;
  slug: string;
  verificationStatus: VerificationStatus;
  publicationStatus: PublicationStatus;
  lastReviewedAt: Date | null;
  nextReviewDueAt: Date | null;
  daysOverdue: number | null;
};

const FLAGGED_STATUSES: VerificationStatus[] = ["POC_SEED", "UNVERIFIED", "NEEDS_REVIEW"];

function toQueueItem(
  row: {
    id: string;
    slug: string;
    verificationStatus: VerificationStatus;
    publicationStatus: PublicationStatus;
    lastReviewedAt: Date | null;
    nextReviewDueAt: Date | null;
  },
  title: string,
  type: ReviewQueueItem["type"]
): ReviewQueueItem {
  const now = Date.now();
  const daysOverdue = row.nextReviewDueAt
    ? Math.floor((now - row.nextReviewDueAt.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  return {
    id: row.id,
    type,
    title,
    slug: row.slug,
    verificationStatus: row.verificationStatus,
    publicationStatus: row.publicationStatus,
    lastReviewedAt: row.lastReviewedAt,
    nextReviewDueAt: row.nextReviewDueAt,
    daysOverdue,
  };
}

/**
 * Careers, schools, and programs flagged for review — either their
 * verification status isn't VERIFIED yet, or their scheduled review date
 * has passed. Ordered most-overdue first.
 */
export async function getReviewQueueItems(limit = 200): Promise<ReviewQueueItem[]> {
  // Career has nextReviewDueAt; School/Program don't, so they're flagged by
  // verification status alone.
  const careerWhere: Prisma.CareerWhereInput = {
    OR: [{ verificationStatus: { in: FLAGGED_STATUSES } }, { nextReviewDueAt: { lte: new Date() } }],
  };
  const flaggedStatusWhere = { verificationStatus: { in: FLAGGED_STATUSES } };

  const [careers, schools, programs] = await Promise.all([
    prisma.career.findMany({
      where: careerWhere,
      select: {
        id: true,
        slug: true,
        title: true,
        verificationStatus: true,
        publicationStatus: true,
        lastReviewedAt: true,
        nextReviewDueAt: true,
      },
      take: limit,
    }),
    prisma.school.findMany({
      where: flaggedStatusWhere,
      select: {
        id: true,
        slug: true,
        name: true,
        verificationStatus: true,
        publicationStatus: true,
        createdAt: true,
      },
      take: limit,
    }),
    prisma.program.findMany({
      where: flaggedStatusWhere,
      select: {
        id: true,
        slug: true,
        name: true,
        verificationStatus: true,
        publicationStatus: true,
        createdAt: true,
      },
      take: limit,
    }),
  ]);

  const items: ReviewQueueItem[] = [
    ...careers.map((c) => toQueueItem(c, c.title, "career")),
    // School/Program have no lastReviewedAt/nextReviewDueAt columns in the schema;
    // surface them with nulls so they still appear in the flagged-status queue.
    ...schools.map((s) =>
      toQueueItem({ ...s, lastReviewedAt: null, nextReviewDueAt: null }, s.name, "school")
    ),
    ...programs.map((p) =>
      toQueueItem({ ...p, lastReviewedAt: null, nextReviewDueAt: null }, p.name, "program")
    ),
  ];

  // Most overdue first (nulls last), then by verification status severity.
  const severity: Record<VerificationStatus, number> = {
    POC_SEED: 0,
    UNVERIFIED: 1,
    NEEDS_REVIEW: 2,
    VERIFIED: 3,
    ARCHIVED: 4,
  };
  items.sort((a, b) => {
    const aOver = a.daysOverdue ?? -Infinity;
    const bOver = b.daysOverdue ?? -Infinity;
    if (aOver !== bOver) return bOver - aOver;
    return severity[a.verificationStatus] - severity[b.verificationStatus];
  });

  return items;
}

// ---------------------------------------------------------------------------
// Full admin listings (all publication statuses)
// ---------------------------------------------------------------------------

export type AdminCareerFilters = {
  publicationStatus?: PublicationStatus;
  verificationStatus?: VerificationStatus;
  industryId?: string;
  q?: string;
};

export async function getAllCareersForAdmin(filters: AdminCareerFilters = {}) {
  const where: Prisma.CareerWhereInput = {};
  if (filters.publicationStatus) where.publicationStatus = filters.publicationStatus;
  if (filters.verificationStatus) where.verificationStatus = filters.verificationStatus;
  if (filters.industryId) where.primaryIndustryId = filters.industryId;
  if (filters.q) where.title = { contains: filters.q, mode: "insensitive" };

  return prisma.career.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      primaryIndustry: { select: { id: true, name: true, slug: true } },
      primaryCategory: { select: { id: true, name: true, slug: true } },
      _count: { select: { metrics: true, sourceRefs: true } },
    },
  });
}

export async function getAllIndustriesForAdmin() {
  return prisma.industry.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { categories: true, primaryCareers: true } },
    },
  });
}

export async function getAllCategoriesForAdmin() {
  return prisma.careerCategory.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      industry: { select: { id: true, name: true, slug: true } },
      _count: { select: { primaryCareers: true } },
    },
  });
}

export async function getAllSchoolsForAdmin() {
  return prisma.school.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { schoolPrograms: true } } },
  });
}

export async function getAllProgramsForAdmin() {
  return prisma.program.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { schoolPrograms: true, programCareers: true } } },
  });
}

export async function getAllSourcesForAdmin() {
  return prisma.dataSource.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { careerMetrics: true, careerReferences: true, schoolPrograms: true } } },
  });
}

/**
 * The CareerQuizProfile for one career, if one has been set up yet.
 * Not part of `careerDetailInclude` in lib/db/queries/careers.ts, so the
 * admin editor fetches it separately.
 */
export async function getCareerQuizProfileForAdmin(careerId: string) {
  return prisma.careerQuizProfile.findUnique({ where: { careerId } });
}

// ---------------------------------------------------------------------------
// Quiz structure (read-only inspection)
// ---------------------------------------------------------------------------

export async function getAllQuizzesForAdmin() {
  return prisma.quiz.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: { options: { orderBy: { order: "asc" } } },
          },
        },
      },
      _count: { select: { attempts: true } },
    },
  });
}
