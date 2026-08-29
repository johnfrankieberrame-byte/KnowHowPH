import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { SchoolFilterQuery, ProgramFilterQuery } from "@/lib/validations/schools";

const careerSummarySelect = {
  id: true,
  slug: true,
  title: true,
} satisfies Prisma.CareerSelect;

const schoolListInclude = {
  schoolPrograms: {
    where: { program: { publicationStatus: "PUBLISHED" as const } },
    include: { program: true },
  },
} satisfies Prisma.SchoolInclude;

const schoolDetailInclude = {
  schoolPrograms: {
    where: { program: { publicationStatus: "PUBLISHED" as const } },
    include: {
      program: {
        include: {
          programCareers: {
            where: { career: { publicationStatus: "PUBLISHED" as const } },
            include: { career: { select: careerSummarySelect } },
          },
        },
      },
    },
  },
} satisfies Prisma.SchoolInclude;

const programListInclude = {
  schoolPrograms: {
    where: { school: { publicationStatus: "PUBLISHED" as const } },
    include: { school: true },
  },
  programCareers: {
    where: { career: { publicationStatus: "PUBLISHED" as const } },
    include: { career: { select: careerSummarySelect } },
  },
} satisfies Prisma.ProgramInclude;

const programDetailInclude = {
  schoolPrograms: {
    where: { school: { publicationStatus: "PUBLISHED" as const } },
    include: { school: true },
  },
  programCareers: {
    where: { career: { publicationStatus: "PUBLISHED" as const } },
    include: {
      career: {
        select: { ...careerSummarySelect, shortDescription: true },
      },
    },
  },
} satisfies Prisma.ProgramInclude;

export type SchoolListItem = Prisma.SchoolGetPayload<{ include: typeof schoolListInclude }>;
export type SchoolDetail = Prisma.SchoolGetPayload<{ include: typeof schoolDetailInclude }>;
export type ProgramListItem = Prisma.ProgramGetPayload<{ include: typeof programListInclude }>;
export type ProgramDetail = Prisma.ProgramGetPayload<{ include: typeof programDetailInclude }>;

export async function getPublishedSchools(filters: SchoolFilterQuery = {}): Promise<SchoolListItem[]> {
  const where: Prisma.SchoolWhereInput = { publicationStatus: "PUBLISHED" };
  if (filters.region?.length) where.region = { in: filters.region };
  if (filters.type?.length) where.type = { in: filters.type };
  if (filters.status?.length) where.verificationStatus = { in: filters.status };

  return prisma.school.findMany({
    where,
    include: schoolListInclude,
    orderBy: { name: "asc" },
  });
}

export async function getSchoolBySlug(slug: string): Promise<SchoolDetail | null> {
  return prisma.school.findFirst({
    where: { slug, publicationStatus: "PUBLISHED" },
    include: schoolDetailInclude,
  });
}

export async function getPublishedPrograms(filters: ProgramFilterQuery = {}): Promise<ProgramListItem[]> {
  const where: Prisma.ProgramWhereInput = { publicationStatus: "PUBLISHED" };
  if (filters.credentialType?.length) where.credentialType = { in: filters.credentialType };
  if (filters.deliveryMode?.length) where.deliveryMode = { in: filters.deliveryMode };
  if (filters.status?.length) where.verificationStatus = { in: filters.status };
  if (filters.relatedCareer) {
    where.programCareers = { some: { career: { slug: filters.relatedCareer } } };
  }

  return prisma.program.findMany({
    where,
    include: programListInclude,
    orderBy: { name: "asc" },
  });
}

export async function getProgramBySlug(slug: string): Promise<ProgramDetail | null> {
  return prisma.program.findFirst({
    where: { slug, publicationStatus: "PUBLISHED" },
    include: programDetailInclude,
  });
}

/** Distinct regions among published schools, for building filter options. */
export async function getSchoolRegions(): Promise<string[]> {
  const rows = await prisma.school.findMany({
    where: { publicationStatus: "PUBLISHED" },
    select: { region: true },
    distinct: ["region"],
    orderBy: { region: "asc" },
  });
  return rows.map((r) => r.region);
}
