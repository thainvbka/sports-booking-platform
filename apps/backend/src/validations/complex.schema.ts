import { z } from "zod";

export const createComplexSchema = z.object({
  body: z.object({
    complex_name: z.string().min(3).max(100),
    complex_address: z.string().min(10).max(500),
  }),
});

export const updateComplexSchema = z.object({
  body: z.object({
    complex_name: z.string().min(3).max(100).optional(),
    complex_address: z.string().min(10).max(500).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type CreateComplexInput = z.infer<typeof createComplexSchema>["body"];
export type UpdateComplexInput = z.infer<typeof updateComplexSchema>["body"];
