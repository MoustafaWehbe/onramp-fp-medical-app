import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schemas";

export const createUserClinicSchema = z.object({
  clinicId: z.string().uuid("Invalid clinic id"),
  notes: z
    .string()
    .trim()
    .max(5000, "Notes must be at most 5000 characters")
    .nullable()
    .optional(),
});

export const updateUserClinicSchema = z
  .object({
    notes: z
      .string()
      .trim()
      .max(5000, "Notes must be at most 5000 characters")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => data.notes !== undefined,
    {
      message: "At least one field is required",
    },
  );

export const userClinicIdParamSchema = z.object({
  id: z.string().uuid("Invalid user clinic id"),
});

export const listUserClinicsQuerySchema = paginationQuerySchema.extend({
  search: z
    .string()
    .trim()
    .max(255, "Search must be at most 255 characters")
    .optional(),
});
