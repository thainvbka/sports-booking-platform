import { z } from "zod";

export const baseAccountSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  full_name: z.string().min(5, "Full name is required"),
  phone_number: z
    .string()
    .min(10, "Phone number must be at least 10 digits long"),
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
        company_name: z.string().min(2, "Company name is required"),
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
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
  }),
});

export type registerInput = z.infer<typeof registerSchema>["body"];
export type loginInput = z.infer<typeof loginSchema>["body"];
