import { z } from "zod";

export const createBookingSchema = z
  .object({
    body: z.object({
      start_time: z.coerce.date({
        message: "Thời gian bắt đầu không hợp lệ",
      }),

      end_time: z.coerce.date({
        message: "Thời gian kết thúc không hợp lệ",
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
    message: "Thời gian kết thúc phải sau thời gian bắt đầu",
    path: ["body", "end_time"],
  })
  .refine((data) => data.body.start_time > new Date(), {
    message: "Không thể đặt sân cho thời gian đã qua",
    path: ["body", "start_time"],
  });

// owner booking filter schema

export const ownerBookingFilterSchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELED", "COMPLETED"]).optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  min_price: z.coerce.number().positive().optional(),
  max_price: z.coerce.number().positive().optional(),
  sub_field_id: z.string().uuid().optional(),
});

export const ownerGetBookingsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(8),
  filter: z.string().optional(),
});

export const confirmBookingSchema = z.object({
  params: z.object({
    id: z.string().uuid({
      message: "ID booking không hợp lệ",
    }),
  }),
});

export const ownerCancelBookingSchema = z.object({
  params: z.object({
    id: z.string().uuid({
      message: "ID booking không hợp lệ",
    }),
  }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>["body"];

export type OwnerBookingFilter = z.infer<typeof ownerBookingFilterSchema>;
export type GetOwnerBookingsQuery = z.infer<typeof ownerGetBookingsQuerySchema>;
export type ConfirmBookingParams = z.infer<
  typeof confirmBookingSchema
>["params"];
export type OwnerCancelBookingParams = z.infer<
  typeof ownerCancelBookingSchema
>["params"];
