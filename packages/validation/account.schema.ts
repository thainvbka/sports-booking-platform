import { z } from "zod";

export const accountSchema = z.object({
  body: z.discriminatedUnion("role", [
    z.object({
      role: z.literal("PLAYER"),
    }),
    z.object({
      role: z.literal("OWNER"),
      company_name: z.string().min(2, "Tên công ty là bắt buộc"),
    }),
  ]),
});

export type addRoleInput = z.infer<typeof accountSchema>["body"];
