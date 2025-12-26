import { z } from "zod";

export const RecurringBookingType = {
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
} as const;

export const createRecurringBookingSchema = z
  .object({
    body: z.object({
      start_time: z.coerce.date({
        message: "Start time must be a valid date string",
      }),

      end_time: z.coerce.date({
        message: "End time must be a valid date string",
      }),

      start_date: z.coerce.date({
        message: "Start date must be a valid date string",
      }),

      end_date: z.coerce.date({
        message: "End date must be a valid date string",
      }),

      // day_of_week: z.number().min(0).max(6), // 0 (Chủ nhật) -> 6 (Thứ 7)

      recurring_type: z.nativeEnum(RecurringBookingType),

      // Nếu có thêm type để phân biệt đặt lẻ/cố định
      type: z.enum(["ONE_TIME", "RECURRING"]).optional(),
    }),
    params: z.object({
      id: z.string().uuid(), // sub_field_id
    }),
  })
  .refine((data) => data.body.end_time > data.body.start_time, {
    // Validate nâng cao: Giờ kết thúc phải sau giờ bắt đầu
    message: "End time must be after start time",
    path: ["body", "end_time"],
  });

export type CreateRecurringBookingInput = z.infer<
  typeof createRecurringBookingSchema
>["body"];
