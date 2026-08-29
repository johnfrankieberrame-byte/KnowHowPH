import { z } from "zod";
import {
  CredentialType,
  DeliveryMode,
  EducationLevel,
  EntryDifficulty,
  MetricType,
  PublicationStatus,
  RatingLevel,
  SalaryDataStatus,
  SchoolType,
  SourceType,
  VerificationStatus,
} from "@prisma/client";
import { CONSTRAINT_KEYS, TRAIT_KEYS } from "@/lib/quiz/traits";

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, and hyphen-separated.");

const requiredString = (message = "This field is required.") => z.string().trim().min(1, message);

const optionalDate = z
  .union([z.string(), z.date()])
  .optional()
  .nullable()
  .transform((v) => (v ? new Date(v) : null));

// ---------------------------------------------------------------------------
// Taxonomy: Industry / CareerCategory
// ---------------------------------------------------------------------------

export const industryInputSchema = z.object({
  name: requiredString("Name is required."),
  slug: slugSchema,
  description: requiredString("Description is required."),
  icon: z.string().trim().max(50).optional().nullable(),
  order: z.coerce.number().int().default(0),
  publicationStatus: z.nativeEnum(PublicationStatus).default("PUBLISHED"),
});
export type IndustryInput = z.infer<typeof industryInputSchema>;

export const categoryInputSchema = z.object({
  name: requiredString("Name is required."),
  slug: slugSchema,
  description: requiredString("Description is required."),
  industryId: requiredString("Industry is required."),
  order: z.coerce.number().int().default(0),
  publicationStatus: z.nativeEnum(PublicationStatus).default("PUBLISHED"),
});
export type CategoryInput = z.infer<typeof categoryInputSchema>;

// ---------------------------------------------------------------------------
// Career core fields
// ---------------------------------------------------------------------------

const stringListSchema = z.array(z.string().trim().min(1)).default([]);

export const careerInputSchema = z.object({
  title: requiredString("Title is required."),
  slug: slugSchema,
  shortDescription: requiredString("Short description is required."),
  longDescription: requiredString("Long description is required."),
  primaryIndustryId: requiredString("Primary industry is required."),
  primaryCategoryId: requiredString("Primary category is required."),
  responsibilities: stringListSchema,
  goodFitIf: stringListSchema,
  challengingIf: stringListSchema,
  workEnvironment: requiredString("Work environment is required."),
  workStyleSummary: z.string().trim().max(2000).optional().nullable(),
  educationLevel: z.nativeEnum(EducationLevel),
  entryDifficulty: z.nativeEnum(EntryDifficulty),
  timeToEntryMinMonths: z.coerce.number().int().min(0),
  timeToEntryMaxMonths: z.coerce.number().int().min(0),
  remoteViability: z.nativeEnum(RatingLevel),
  freelanceViability: z.nativeEnum(RatingLevel),
  entryLevelTitle: z.string().trim().max(200).optional().nullable(),
  midLevelTitle: z.string().trim().max(200).optional().nullable(),
  seniorLevelTitle: z.string().trim().max(200).optional().nullable(),
  seoTitle: z.string().trim().max(200).optional().nullable(),
  seoDescription: z.string().trim().max(400).optional().nullable(),
  publicationStatus: z.nativeEnum(PublicationStatus).default("DRAFT"),
  verificationStatus: z.nativeEnum(VerificationStatus).default("POC_SEED"),
  lastReviewedAt: optionalDate,
  nextReviewDueAt: optionalDate,
})
  .refine((data) => data.timeToEntryMaxMonths >= data.timeToEntryMinMonths, {
    message: "Max time-to-entry must be greater than or equal to min.",
    path: ["timeToEntryMaxMonths"],
  });
export type CareerInput = z.infer<typeof careerInputSchema>;

/** Partial variant for PATCH — same field rules, all optional, no cross-field refine. */
export const careerUpdateSchema = z.object({
  title: requiredString().optional(),
  slug: slugSchema.optional(),
  shortDescription: requiredString().optional(),
  longDescription: requiredString().optional(),
  primaryIndustryId: requiredString().optional(),
  primaryCategoryId: requiredString().optional(),
  responsibilities: stringListSchema.optional(),
  goodFitIf: stringListSchema.optional(),
  challengingIf: stringListSchema.optional(),
  workEnvironment: requiredString().optional(),
  workStyleSummary: z.string().trim().max(2000).optional().nullable(),
  educationLevel: z.nativeEnum(EducationLevel).optional(),
  entryDifficulty: z.nativeEnum(EntryDifficulty).optional(),
  timeToEntryMinMonths: z.coerce.number().int().min(0).optional(),
  timeToEntryMaxMonths: z.coerce.number().int().min(0).optional(),
  remoteViability: z.nativeEnum(RatingLevel).optional(),
  freelanceViability: z.nativeEnum(RatingLevel).optional(),
  entryLevelTitle: z.string().trim().max(200).optional().nullable(),
  midLevelTitle: z.string().trim().max(200).optional().nullable(),
  seniorLevelTitle: z.string().trim().max(200).optional().nullable(),
  seoTitle: z.string().trim().max(200).optional().nullable(),
  seoDescription: z.string().trim().max(400).optional().nullable(),
  publicationStatus: z.nativeEnum(PublicationStatus).optional(),
  verificationStatus: z.nativeEnum(VerificationStatus).optional(),
  lastReviewedAt: optionalDate,
  nextReviewDueAt: optionalDate,
});
export type CareerUpdateInput = z.infer<typeof careerUpdateSchema>;

export const careerPublishSchema = z.object({
  publicationStatus: z.nativeEnum(PublicationStatus).default("PUBLISHED"),
});

export const careerReviewSchema = z.object({
  verificationStatus: z.nativeEnum(VerificationStatus),
  note: z.string().trim().max(2000).optional(),
  nextReviewDueAt: optionalDate,
});
export type CareerReviewInput = z.infer<typeof careerReviewSchema>;

// ---------------------------------------------------------------------------
// CareerMetric
// ---------------------------------------------------------------------------

export const careerMetricInputSchema = z
  .object({
    metricType: z.nativeEnum(MetricType),
    salaryMin: z.coerce.number().int().nonnegative().optional().nullable(),
    salaryMax: z.coerce.number().int().nonnegative().optional().nullable(),
    currency: z.string().trim().min(1).default("PHP"),
    rating: z.nativeEnum(RatingLevel).optional().nullable(),
    geography: z.string().trim().min(1).default("Philippines"),
    experienceLevel: z.string().trim().max(100).optional().nullable(),
    periodLabel: z.string().trim().max(100).optional().nullable(),
    methodologyNote: z.string().trim().max(2000).optional().nullable(),
    status: z.nativeEnum(SalaryDataStatus).default("POC_ESTIMATE"),
    effectiveDate: optionalDate,
    sourceId: z.string().trim().min(1).optional().nullable(),
  })
  .refine(
    (data) =>
      data.metricType !== "SALARY" ||
      data.salaryMin != null ||
      data.salaryMax != null ||
      data.rating != null,
    { message: "Provide a salary range or rating for a SALARY metric.", path: ["salaryMin"] }
  )
  .refine((data) => data.salaryMin == null || data.salaryMax == null || data.salaryMax >= data.salaryMin, {
    message: "Salary max must be greater than or equal to salary min.",
    path: ["salaryMax"],
  });
export type CareerMetricInput = z.infer<typeof careerMetricInputSchema>;

export const careerMetricUpdateSchema = z.object({
  metricType: z.nativeEnum(MetricType).optional(),
  salaryMin: z.coerce.number().int().nonnegative().optional().nullable(),
  salaryMax: z.coerce.number().int().nonnegative().optional().nullable(),
  currency: z.string().trim().min(1).optional(),
  rating: z.nativeEnum(RatingLevel).optional().nullable(),
  geography: z.string().trim().min(1).optional(),
  experienceLevel: z.string().trim().max(100).optional().nullable(),
  periodLabel: z.string().trim().max(100).optional().nullable(),
  methodologyNote: z.string().trim().max(2000).optional().nullable(),
  status: z.nativeEnum(SalaryDataStatus).optional(),
  effectiveDate: optionalDate,
  sourceId: z.string().trim().min(1).optional().nullable(),
});
export type CareerMetricUpdateInput = z.infer<typeof careerMetricUpdateSchema>;

// ---------------------------------------------------------------------------
// DataSource
// ---------------------------------------------------------------------------

export const dataSourceInputSchema = z.object({
  title: requiredString("Title is required."),
  publisher: requiredString("Publisher is required."),
  url: z.string().trim().url("Must be a valid URL.").optional().nullable().or(z.literal("")),
  sourceType: z.nativeEnum(SourceType),
  sourceDate: optionalDate,
  retrievedDate: optionalDate,
  methodologySummary: z.string().trim().max(2000).optional().nullable(),
  verificationStatus: z.nativeEnum(VerificationStatus).default("UNVERIFIED"),
  notes: z.string().trim().max(2000).optional().nullable(),
  archivedUrl: z.string().trim().url("Must be a valid URL.").optional().nullable().or(z.literal("")),
});
export type DataSourceInput = z.infer<typeof dataSourceInputSchema>;

export const dataSourceUpdateSchema = dataSourceInputSchema.partial();
export type DataSourceUpdateInput = z.infer<typeof dataSourceUpdateSchema>;

// ---------------------------------------------------------------------------
// CareerSourceReference
// ---------------------------------------------------------------------------

export const careerSourceReferenceInputSchema = z.object({
  sourceId: requiredString("Source is required."),
  fieldContext: requiredString("Field context is required (e.g. \"salary\", \"demand\")."),
  note: z.string().trim().max(1000).optional().nullable(),
});
export type CareerSourceReferenceInput = z.infer<typeof careerSourceReferenceInputSchema>;

// ---------------------------------------------------------------------------
// School / Program
// ---------------------------------------------------------------------------

export const schoolInputSchema = z.object({
  name: requiredString("Name is required."),
  slug: slugSchema,
  type: z.nativeEnum(SchoolType),
  region: requiredString("Region is required."),
  provinceCity: requiredString("Province/city is required."),
  website: z.string().trim().url("Must be a valid URL.").optional().nullable().or(z.literal("")),
  description: requiredString("Description is required."),
  accreditationNote: z.string().trim().max(1000).optional().nullable(),
  verificationStatus: z.nativeEnum(VerificationStatus).default("POC_SEED"),
  publicationStatus: z.nativeEnum(PublicationStatus).default("PUBLISHED"),
});
export type SchoolInput = z.infer<typeof schoolInputSchema>;
export const schoolUpdateSchema = schoolInputSchema.partial();
export type SchoolUpdateInput = z.infer<typeof schoolUpdateSchema>;

export const programInputSchema = z.object({
  name: requiredString("Name is required."),
  slug: slugSchema,
  credentialType: z.nativeEnum(CredentialType),
  durationLabel: requiredString("Duration label is required."),
  deliveryMode: z.nativeEnum(DeliveryMode),
  admissionNotes: z.string().trim().max(2000).optional().nullable(),
  tuitionNote: z.string().trim().max(500).optional().nullable(),
  verificationStatus: z.nativeEnum(VerificationStatus).default("POC_SEED"),
  publicationStatus: z.nativeEnum(PublicationStatus).default("PUBLISHED"),
});
export type ProgramInput = z.infer<typeof programInputSchema>;
export const programUpdateSchema = programInputSchema.partial();
export type ProgramUpdateInput = z.infer<typeof programUpdateSchema>;

// ---------------------------------------------------------------------------
// CareerQuizProfile
// ---------------------------------------------------------------------------

const traitKeyEnum = z.enum(TRAIT_KEYS);
const constraintKeyEnum = z.enum(CONSTRAINT_KEYS);

/** Record<TraitKey, number 0-100>, every key required so the matcher never sees a gap. */
export const idealTraitsSchema = z.record(traitKeyEnum, z.coerce.number().min(0).max(100));

/** Record<TraitKey, number 0-3> relative importance weight. */
export const traitWeightsSchema = z.record(traitKeyEnum, z.coerce.number().min(0).max(3));

export const careerQuizProfileInputSchema = z.object({
  idealTraits: idealTraitsSchema,
  traitWeights: traitWeightsSchema,
  hardConstraints: z.array(constraintKeyEnum).default([]),
  calculationVersion: z.coerce.number().int().min(1).default(1),
});
export type CareerQuizProfileInput = z.infer<typeof careerQuizProfileInputSchema>;

// ---------------------------------------------------------------------------
// Quiz (read-only inspection + isActive toggle)
// ---------------------------------------------------------------------------

export const quizToggleActiveSchema = z.object({
  isActive: z.boolean(),
});
