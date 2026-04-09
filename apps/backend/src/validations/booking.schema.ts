import { z } from "zod";
import { getVietnamMinutes } from "../helpers/time.helper";

const isHalfHourAlignedInVietnam = (date: Date): boolean => {
  return getVietnamMinutes(date) % 30 === 0;
};

const bookingAddonItemSchema = z.object({
  product_id: z.string().uuid("ID sản phẩm không hợp lệ"),
  quantity: z.coerce
    .number()
    .int("Số lượng add-on phải là số nguyên")
    .positive("Số lượng add-on phải lớn hơn 0"),
});

export const createBookingSchema = z
  .object({
    body: z.object({
      start_time: z.coerce.date({
        message: "Thời gian bắt đầu không hợp lệ",
      }),

      end_time: z.coerce.date({
        message: "Thời gian kết thúc không hợp lệ",
      }),
      addons: z.array(bookingAddonItemSchema).optional(),
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
  })
  .refine((data) => isHalfHourAlignedInVietnam(data.body.start_time), {
    message: "Giờ bắt đầu phải là mốc 30 phút (ví dụ: 19:00, 19:30)",
    path: ["body", "start_time"],
  })
  .refine((data) => isHalfHourAlignedInVietnam(data.body.end_time), {
    message: "Giờ kết thúc phải là mốc 30 phút (ví dụ: 20:00, 20:30)",
    path: ["body", "end_time"],
  })
  .refine(
    (data) => {
      // Validate thời lượng phải là bội của 30 phút
      const durationMs =
        data.body.end_time.getTime() - data.body.start_time.getTime();
      const durationMinutes = durationMs / (1000 * 60);
      return durationMinutes > 0 && durationMinutes % 30 === 0;
    },
    {
      message:
        "Thời lượng đặt sân phải là bội của 30 phút (0.5 giờ, 1 giờ, 1.5 giờ, ...)",
      path: ["body", "end_time"],
    },
  );

export const syncBookingAddonsSchema = z.object({
  body: z.object({
    addons: z.array(bookingAddonItemSchema).default([]),
  }),
  params: z.object({
    id: z.string().uuid({
      message: "ID booking không hợp lệ",
    }),
  }),
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
export type BookingAddonInput = z.infer<typeof bookingAddonItemSchema>;
export type UpdateBookingAddonsInput = z.infer<
  typeof syncBookingAddonsSchema
>["body"];

export type OwnerBookingFilter = z.infer<typeof ownerBookingFilterSchema>;
export type GetOwnerBookingsQuery = z.infer<typeof ownerGetBookingsQuerySchema>;
export type ConfirmBookingParams = z.infer<
  typeof confirmBookingSchema
>["params"];
export type OwnerCancelBookingParams = z.infer<
  typeof ownerCancelBookingSchema
>["params"];
