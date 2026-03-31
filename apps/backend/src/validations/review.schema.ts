import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    booking_id: z.string().uuid("Invalid booking ID"),
    rating: z.coerce
      .number()
      .int()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5"),
    comment: z
      .string()
      .max(500, "Comment must be at most 500 characters")
      .optional(),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.coerce
      .number()
      .int()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5")
      .optional(),
    comment: z
      .string()
      .max(500, "Comment must be at most 500 characters")
      .optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid review ID"),
  }),
});

export const reviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  has_images: z.preprocess((val) => val === "true", z.boolean()).optional(),
  sort_by: z
    .enum(["newest", "oldest", "rating_desc", "rating_asc"])
    .default("newest"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>["body"];
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>["body"];
export type ReviewQueryInput = z.infer<typeof reviewQuerySchema>;
