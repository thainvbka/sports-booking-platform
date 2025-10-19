import { z } from "zod";

export const userSignupSchema = z.object({
  body: z
    .object({
      email: z.string().email("Invalid email address"),
      password_hash: z
        .string()
        .min(8, "Password must be at least 8 characters long"),
      full_name: z.string().min(5, "Full name is required"),
      phone_number: z
        .string()
        .min(10, "Phone number must be at least 10 digits long"),
      role: z.enum(["PLAYER", "ADMIN", "OWNER"]),
      level: z
        .enum(["BEGINNER", "AMATEUR", "INTERMEDIATE", "ADVANCED", "PRO"])
        .optional(),
      avatar: z.string().url().optional(),
      company_name: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.role === "PLAYER" && data.company_name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Company name is not allowed for PLAYER role",
          path: ["company_name"],
        });
      }
    }),
});

export const userLoginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password_hash: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
  }),
});

export type UserSignupInput = z.infer<typeof userSignupSchema>["body"];
export type UserLoginInput = z.infer<typeof userLoginSchema>["body"];
