import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schemas";

export const createUserDoctorSchema = z.object({
  doctorId: z.string().uuid("Invalid doctor id"),
  userClinicId: z.string().uuid("Invalid user clinic id").nullable().optional(),
  notes: z
    .string()
    .trim()
    .max(5000, "Notes must be at most 5000 characters")
    .nullable()
    .optional(),
});

export const updateUserDoctorSchema = z
  .object({
    userClinicId: z
      .string()
      .uuid("Invalid user clinic id")
      .nullable()
      .optional(),
    notes: z
      .string()
      .trim()
      .max(5000, "Notes must be at most 5000 characters")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => data.userClinicId !== undefined || data.notes !== undefined,
    { message: "At least one field is required" },
  );

export const userDoctorIdParamSchema = z.object({
  id: z.string().uuid("Invalid user doctor id"),
});

export const listUserDoctorsQuerySchema = paginationQuerySchema.extend({
  search: z
    .string()
    .trim()
    .max(255, "Search must be at most 255 characters")
    .optional(),
});
