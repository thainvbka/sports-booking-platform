import { z } from "zod";

const notificationTypeSchema = z.enum(["BOOKING", "MATCH", "PAYMENT", "SYSTEM"]);
const notificationTargetRoleSchema = z.enum(["PLAYER", "OWNER", "ADMIN"]);
const booleanStringSchema = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((value) => (typeof value === "boolean" ? value : value === "true"));

export const notificationListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    is_read: booleanStringSchema.optional(),
    type: notificationTypeSchema.optional(),
    target_role: notificationTargetRoleSchema.optional(),
  }),
});

export const notificationRoleFilterQuerySchema = z.object({
  query: z.object({
    target_role: notificationTargetRoleSchema.optional(),
  }),
});

export const notificationIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Notification ID không hợp lệ"),
  }),
});

export const sendNotificationSchema = z.object({
  body: z.object({
    message: z
      .string()
      .trim()
      .min(1, "Message không được để trống")
      .max(500, "Message tối đa 500 ký tự"),
    type: notificationTypeSchema,
    target_role: notificationTargetRoleSchema,
    link_to: z
      .string()
      .trim()
      .startsWith("/", "link_to phải là đường dẫn nội bộ bắt đầu bằng '/'")
      .max(255, "Link tối đa 255 ký tự")
      .optional(),
  }),
});

export type NotificationListQuery = z.infer<
  typeof notificationListQuerySchema
>["query"];
export type NotificationRoleFilterQuery = z.infer<
  typeof notificationRoleFilterQuerySchema
>["query"];
export type SendNotificationInput = z.infer<typeof sendNotificationSchema>["body"];

