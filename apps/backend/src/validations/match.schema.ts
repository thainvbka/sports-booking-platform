import { z } from "zod";

const matchStatusSchema = z.enum([
  "OPEN",
  "FULL",
  "CLOSED",
  "EXPIRED",
  "CANCELED",
  "COMPLETED",
]);

const participantStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
  "REMOVED",
]);

const skillLevelSchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);

const sportTypeSchema = z.enum([
  "FOOTBALL",
  "BASKETBALL",
  "TENNIS",
  "BADMINTON",
  "VOLLEYBALL",
  "PICKLEBALL",
]);

export const createMatchSchema = z.object({
  body: z.object({
    booking_id: z.string().uuid("Booking ID không hợp lệ"),
    title: z
      .string()
      .trim()
      .min(5, "Tiêu đề phải có ít nhất 5 ký tự")
      .max(200, "Tiêu đề tối đa 200 ký tự"),
    description: z
      .string()
      .trim()
      .max(1000, "Mô tả tối đa 1000 ký tự")
      .optional(),
    slots_needed: z.coerce
      .number()
      .int("slots_needed phải là số nguyên")
      .min(1, "slots_needed tối thiểu là 1")
      .max(30, "slots_needed tối đa là 30"),
    skill_level: skillLevelSchema.optional(),
    join_deadline: z.coerce.date().optional(),
  }),
});

export const joinMatchSchema = z.object({
  params: z.object({
    id: z.string().uuid("Match ID không hợp lệ"),
  }),
  body: z.object({
    introduction: z
      .string()
      .trim()
      .max(1000, "Giới thiệu tối đa 1000 ký tự")
      .optional(),
  }),
});

export const matchIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Match ID không hợp lệ"),
  }),
});

export const participantActionSchema = z.object({
  params: z.object({
    id: z.string().uuid("Match ID không hợp lệ"),
    participantId: z.string().uuid("Participant ID không hợp lệ"),
  }),
});

export const getPublicMatchesQuerySchema = z.object({
  query: z.object({
    sport_type: sportTypeSchema.optional(),
    skill_level: skillLevelSchema.optional(),
    status: matchStatusSchema.optional(),
    from_time: z.coerce.date().optional(),
    to_time: z.coerce.date().optional(),
    complex_id: z.string().uuid().optional(),
    sub_field_id: z.string().uuid().optional(),
    province: z.string().trim().optional(),
    district: z.string().trim().optional(),
    q: z.string().trim().optional(),
    sort: z
      .enum(["start_time:asc", "start_time:desc", "created_at:desc"])
      .optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
});

export const getMyMatchesQuerySchema = z.object({
  query: z.object({
    type: z.enum(["created", "joined", "pending"]).default("created"),
    status: matchStatusSchema.optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export const getMatchParticipantsQuerySchema = z.object({
  params: z.object({
    id: z.string().uuid("Match ID không hợp lệ"),
  }),
  query: z.object({
    status: participantStatusSchema.optional(),
    q: z.string().trim().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>["body"];
export type JoinMatchInput = z.infer<typeof joinMatchSchema>["body"];
export type PublicMatchesQuery = z.infer<
  typeof getPublicMatchesQuerySchema
>["query"];
export type MyMatchesQuery = z.infer<typeof getMyMatchesQuerySchema>["query"];
export type MatchParticipantsQuery = z.infer<
  typeof getMatchParticipantsQuerySchema
>["query"];
