import { z } from "zod";

export const createBookingSchema = z
  .object({
    body: z.object({
      start_time: z.coerce.date({
        message: "Start time must be a valid date string",
      }),

      end_time: z.coerce.date({
        message: "End time must be a valid date string",
      }),

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

export type CreateBookingInput = z.infer<typeof createBookingSchema>["body"];
