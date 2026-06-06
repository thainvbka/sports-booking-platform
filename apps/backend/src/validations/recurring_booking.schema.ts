import { z } from "zod";
import { isHalfHourAlignedInVietnam, validateDuration30MinMultiple } from "./shared";

export const RecurringBookingType = {
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
} as const;

export const createRecurringBookingSchema = z
  .object({
    body: z.object({
      start_time: z.coerce.date({
        message: "Thời gian bắt đầu không hợp lệ",
      }),

      end_time: z.coerce.date({
        message: "Thời gian kết thúc không hợp lệ",
      }),

      start_date: z.coerce.date({
        message: "Ngày bắt đầu không hợp lệ",
      }),

      end_date: z.coerce.date({
        message: "Ngày kết thúc không hợp lệ",
      }),

      // day_of_week: z.number().min(0).max(6), // 0 (Chủ nhật) -> 6 (Thứ 7)

      recurring_type: z.nativeEnum(RecurringBookingType),

      // Nếu có thêm type để phân biệt đặt lẻ/cố định
      type: z.enum(["ONE_TIME", "RECURRING"]).optional(),

      // Recurring booking không hỗ trợ addons ở bước tạo chuỗi.
      addons: z.unknown().optional(),
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
  .refine(
    (data) => data.body.start_date >= new Date(new Date().setHours(0, 0, 0, 0)),
    {
      message: "Không thể đặt lịch định kỳ cho ngày đã qua",
      path: ["body", "start_date"],
    },
  )
  .refine((data) => isHalfHourAlignedInVietnam(data.body.start_time), {
    message: "Giờ bắt đầu phải là mốc 30 phút (ví dụ: 19:00, 19:30)",
    path: ["body", "start_time"],
  })
  .refine((data) => isHalfHourAlignedInVietnam(data.body.end_time), {
    message: "Giờ kết thúc phải là mốc 30 phút (ví dụ: 20:00, 20:30)",
    path: ["body", "end_time"],
  })
  .refine(
    (data) => validateDuration30MinMultiple(data.body.start_time, data.body.end_time),
    {
      message:
        "Thời lượng đặt sân phải là bội của 30 phút (0.5 giờ, 1 giờ, 1.5 giờ, ...)",
      path: ["body", "end_time"],
    },
  )
  .refine((data) => data.body.addons === undefined, {
    message: "ADDON_NOT_ALLOWED_FOR_RECURRING",
    path: ["body", "addons"],
  });

export type CreateRecurringBookingInput = z.infer<
  typeof createRecurringBookingSchema
>["body"];
