import { ComplexStatus } from "@prisma/client";
import { z } from "zod";

export const updateUserStatusSchema = z.object({
  body: z.object({
    role: z.enum(["PLAYER", "OWNER", "ADMIN"]),
    status: z.string().min(1, "Status is required"),
  }),
  params: z.object({
    id: z.string().uuid("Invalid account ID"),
  }),
});

export const updateComplexStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(ComplexStatus),
  }),
  params: z.object({
    id: z.string().uuid("Invalid complex ID"),
  }),
});

export const adminQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 10)),
    search: z.string().optional(),
    role: z.enum(["PLAYER", "OWNER", "ADMIN"]).optional(),
    status: z.string().optional(),
  }),
});
