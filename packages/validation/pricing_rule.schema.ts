import { z } from "zod";

export const createPricingRuleSchema = z.object({
  body: z.object({
    sub_field_id: z.string().uuid(),
    day_of_week: z.array(z.number().min(0).max(6)).min(1), // 0 (Chủ nhật) -> 6 (Thứ 7)
    time_slots: z
      .array(
        z.object({
          start_time: z
            .string()
            .regex(
              /^([0-1]\d|2[0-3]):([0-5]\d)$/,
              "Invalid time format (HH:mm)"
            ),
          end_time: z
            .string()
            .regex(
              /^([0-1]\d|2[0-3]):([0-5]\d)$/,
              "Invalid time format (HH:mm)"
            ),
          base_price: z.coerce.number().min(0),
        })
      )
      .min(1),
  }),
});

export const updatePricingRuleSchema = z.object({
  body: z.object({
    sub_field_id: z.string().uuid(),
    day_of_week: z.number().min(0).max(6).optional(), // 0 (Chủ nhật) -> 6 (Thứ 7)
    start_time: z
      .string()
      .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
      .optional(),

    end_time: z
      .string()
      .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
      .optional(),
    base_price: z.coerce.number().min(0).optional(),
  }),
});

export type CreatePricingRuleInput = z.infer<
  typeof createPricingRuleSchema
>["body"];
export type UpdatePricingRuleInput = z.infer<
  typeof updatePricingRuleSchema
>["body"];
