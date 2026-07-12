import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schemas";

const doctorNameSchema = z
  .string()
  .min(1, "Name is required")
  .max(255, "Name must be at most 255 characters");

const doctorSpecialtySchema = z
  .string()
  .max(255, "Specialty must be at most 255 characters")
  .optional();

const doctorPhoneSchema = z
  .string()
  .max(50, "Phone must be at most 50 characters")
  .optional();

export const createDoctorSchema = z.object({
  name: doctorNameSchema,
  specialty: doctorSpecialtySchema,
  phone: doctorPhoneSchema,
});

export const doctorIdParamSchema = z.object({
  id: z.string().uuid("Invalid doctor id"),
});

export const listDoctorsQuerySchema = paginationQuerySchema.extend({
  search: z
    .string()
    .trim()
    .max(255, "Search must be at most 255 characters")
    .optional(),
});
