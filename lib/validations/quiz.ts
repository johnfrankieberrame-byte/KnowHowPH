import { z } from "zod";

export const createAttemptSchema = z.object({
  quizId: z.string().min(1),
});

export const answerValueSchema = z.union([z.string(), z.array(z.string())]);

export const patchAttemptSchema = z.object({
  currentStep: z.number().int().min(0).optional(),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        value: answerValueSchema,
      })
    )
    .max(50)
    .optional(),
});

export const saveResultSchema = z.object({
  resultToken: z.string().min(1),
});
