import { z } from "zod";
import { CredentialType, DeliveryMode, SchoolType, VerificationStatus } from "@prisma/client";

const coerceArray = (v: unknown) => (Array.isArray(v) ? v : v ? [v] : undefined);

export const schoolFilterQuerySchema = z.object({
  region: z.preprocess(coerceArray, z.array(z.string()).optional()),
  type: z.preprocess(coerceArray, z.array(z.nativeEnum(SchoolType)).optional()),
  status: z.preprocess(coerceArray, z.array(z.nativeEnum(VerificationStatus)).optional()),
});

export type SchoolFilterQuery = z.infer<typeof schoolFilterQuerySchema>;

export const programFilterQuerySchema = z.object({
  credentialType: z.preprocess(coerceArray, z.array(z.nativeEnum(CredentialType)).optional()),
  deliveryMode: z.preprocess(coerceArray, z.array(z.nativeEnum(DeliveryMode)).optional()),
  relatedCareer: z.string().trim().min(1).optional(),
  status: z.preprocess(coerceArray, z.array(z.nativeEnum(VerificationStatus)).optional()),
});

export type ProgramFilterQuery = z.infer<typeof programFilterQuerySchema>;
