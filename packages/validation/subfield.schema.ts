import { z } from "zod";

export const SportType = {
  FOOTBALL: "FOOTBALL",
  BASKETBALL: "BASKETBALL",
  TENNIS: "TENNIS",
  BADMINTON: "BADMINTON",
  VOLLEYBALL: "VOLLEYBALL",
  PICKLEBALL: "PICKLEBALL",
} as const;

export const createSubfieldSchema = z.object({
  body: z.object({
    subfield_name: z.string().min(3).max(100),
    capacity: z.coerce.number().int().positive().max(30),
    sport_type: z.nativeEnum(SportType),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const updateSubfieldSchema = z.object({
  body: z.object({
    subfield_name: z.string().min(3).max(100).optional(),
    capacity: z.coerce.number().int().positive().max(30).optional(),
    sport_type: z.nativeEnum(SportType).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type CreateSubfieldInput = z.infer<typeof createSubfieldSchema>["body"];
export type UpdateSubfieldInput = z.infer<typeof updateSubfieldSchema>["body"];
