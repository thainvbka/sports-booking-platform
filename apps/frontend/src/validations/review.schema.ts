import { z } from "zod";

export const createReviewFormSchema = z.object({
  rating: z
    .number({ message: "Vui lòng chọn số sao" })
    .int("Rating không hợp lệ")
    .min(1, "Rating phải từ 1 đến 5")
    .max(5, "Rating phải từ 1 đến 5"),
  comment: z.string().max(500, "Comment tối đa 500 ký tự").optional(),
});

export type CreateReviewFormInput = z.infer<typeof createReviewFormSchema>;
