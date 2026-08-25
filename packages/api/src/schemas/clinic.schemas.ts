import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schemas";

const clinicNameSchema = z
  .string()
  .min(1, "Name is required")
  .max(255, "Name must be at most 255 characters");

const clinicAddressSchema = z
  .string()
  .min(1, "Address is required")
  .max(5000, "Address must be at most 5000 characters");

const clinicPhoneSchema = z
  .string()
  .min(1, "Phone is required")
  .max(50, "Phone must be at most 50 characters");

export const createClinicSchema = z.object({
  name: clinicNameSchema,
  address: clinicAddressSchema,
  phone: clinicPhoneSchema,
});

const optionalDate = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (!value) return true;

      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
      }

      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));

      return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
      );
    },
    {
      message: "Invalid date. Expected a valid YYYY-MM-DD date.",
    },
  )
  .transform((value) => value || undefined)
  .optional();

export const clinicIdParamSchema = z.object({
  id: z.string().uuid("Invalid clinic id"),
});

export const listClinicsQuerySchema = paginationQuerySchema.extend({
  search: z
    .string()
    .trim()
    .max(255, "Search must be at most 255 characters")
    .optional(),

     sortBy: z
      .enum(["name", "createdAt"])
      .optional()
      .default("name"),
  
    sortOrder: z
      .enum(["asc", "desc"])
      .optional()
      .default("asc"),
  
      dateFrom: optionalDate,
      dateTo: optionalDate,
});
