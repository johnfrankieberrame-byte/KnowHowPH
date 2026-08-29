import { z } from "zod";
import {
  EducationLevel,
  EntryDifficulty,
  PathwayType,
  RatingLevel,
  VerificationStatus,
} from "@prisma/client";

const coerceArray = (v: unknown) => (Array.isArray(v) ? v : v ? [v] : undefined);

export const careerSearchQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  industry: z.preprocess(coerceArray, z.array(z.string()).optional()),
  category: z.preprocess(coerceArray, z.array(z.string()).optional()),
  educationLevel: z.preprocess(coerceArray, z.array(z.nativeEnum(EducationLevel)).optional()),
  entryPathway: z.preprocess(coerceArray, z.array(z.nativeEnum(PathwayType)).optional()),
  salaryMin: z.coerce.number().int().nonnegative().optional(),
  salaryMax: z.coerce.number().int().nonnegative().optional(),
  demand: z.preprocess(coerceArray, z.array(z.nativeEnum(RatingLevel)).optional()),
  saturation: z.preprocess(coerceArray, z.array(z.nativeEnum(RatingLevel)).optional()),
  remote: z.preprocess(coerceArray, z.array(z.nativeEnum(RatingLevel)).optional()),
  freelance: z.preprocess(coerceArray, z.array(z.nativeEnum(RatingLevel)).optional()),
  workStyleTag: z.preprocess(coerceArray, z.array(z.string()).optional()),
  skill: z.preprocess(coerceArray, z.array(z.string()).optional()),
  entryDifficulty: z.preprocess(coerceArray, z.array(z.nativeEnum(EntryDifficulty)).optional()),
  status: z.preprocess(coerceArray, z.array(z.nativeEnum(VerificationStatus)).optional()),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
  sort: z.enum(["relevance", "title_asc", "salary_desc", "demand_desc", "newest"]).default("relevance"),
});

export type CareerSearchQuery = z.infer<typeof careerSearchQuerySchema>;

export const compareQuerySchema = z.object({
  slugs: z
    .string()
    .transform((s) => s.split(",").map((x) => x.trim()).filter(Boolean))
    .pipe(z.array(z.string()).min(1).max(3)),
});

export const savedCareerSchema = z.object({
  careerId: z.string().min(1),
});
