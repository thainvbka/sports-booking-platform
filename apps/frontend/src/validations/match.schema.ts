import { MATCH_SKILL_LEVELS } from "@/types/match.type";
import { z } from "zod";

const skillLevelSchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);

export const createMatchFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Tiêu đề phải có ít nhất 5 ký tự")
    .max(200, "Tiêu đề tối đa 200 ký tự"),
  slots_needed: z
    .number()
    .int("Số người cần thêm phải là số nguyên")
    .min(1, "Số người cần thêm tối thiểu là 1")
    .max(30, "Số người cần thêm tối đa là 30"),
  skill_level: skillLevelSchema.nullable().optional(),
  join_deadline: z
    .string()
    .optional()
    .refine(
      (value) => !value || !Number.isNaN(new Date(value).getTime()),
      "Hạn đăng ký không hợp lệ",
    ),
  description: z.string().optional().refine(
    (value) => !value || value.length <= 1000,
    "Mô tả tối đa 1000 ký tự",
  ),
});

export const joinMatchFormSchema = z.object({
  introduction: z.string().optional().refine(
    (value) => !value || value.length <= 1000,
    "Giới thiệu tối đa 1000 ký tự",
  ),
});

export type CreateMatchFormValues = z.infer<typeof createMatchFormSchema>;
export type JoinMatchFormValues = z.infer<typeof joinMatchFormSchema>;
