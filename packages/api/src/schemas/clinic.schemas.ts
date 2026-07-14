import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schemas";

const clinicNameSchema = z
  .string()
  .min(1, "Name is required")
  .max(255, "Name must be at most 255 characters");

const clinicAddressSchema = z
  .string()
  .max(5000, "Address must be at most 5000 characters")
  .optional();

const clinicPhoneSchema = z
  .string()
  .max(50, "Phone must be at most 50 characters")
  .optional();

export const createClinicSchema = z.object({
  name: clinicNameSchema,
  address: clinicAddressSchema,
  phone: clinicPhoneSchema,
});

export const clinicIdParamSchema = z.object({
  id: z.string().uuid("Invalid clinic id"),
});

export const listClinicsQuerySchema = paginationQuerySchema.extend({
  search: z
    .string()
    .trim()
    .max(255, "Search must be at most 255 characters")
    .optional(),
});
