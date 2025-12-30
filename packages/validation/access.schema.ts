import { z } from "zod";

export const baseAccountSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  full_name: z.string().min(5, "Họ và tên là bắt buộc"),
  phone_number: z.string().min(10, "Số điện thoại phải có ít nhất 10 chữ số"),
  avatar: z.string().url().optional(),
});

export const registerSchema = z.object({
  body: z.discriminatedUnion("role", [
    //đăng ký làm PLAYER
    z
      .object({
        role: z.literal("PLAYER"),
      })
      .merge(baseAccountSchema),
    //đăng ký làm OWNER
    z
      .object({
        role: z.literal("OWNER"),
        company_name: z.string().min(2, "Tên công ty là bắt buộc"),
      })
      .merge(baseAccountSchema),
    //đăng ký làm ADMIN
    z
      .object({
        role: z.literal("ADMIN"),
      })
      .merge(baseAccountSchema),
  ]),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  }),
});

export type registerInput = z.infer<typeof registerSchema>["body"];
export type loginInput = z.infer<typeof loginSchema>["body"];
