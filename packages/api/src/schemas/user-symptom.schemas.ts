import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schemas";

export const createUserSymptomSchema = z.object({
  catalogId: z.string().uuid("Invalid catalog id"),
});

export const userSymptomIdParamSchema = z.object({
  id: z.string().uuid("Invalid user symptom id"),
});

export const listUserSymptomsQuerySchema = paginationQuerySchema.extend({
  search: z
    .string()
    .trim()
    .max(255, "Search must be at most 255 characters")
    .optional(),
});
