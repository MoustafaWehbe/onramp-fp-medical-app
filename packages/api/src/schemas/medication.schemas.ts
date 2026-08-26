import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schemas";

const medicationNameSchema = z
  .string()
  .min(1, "Name is required")
  .max(255, "Name must be at most 255 characters");

const medicationStrengthSchema = z
  .string()
  .max(100, "Strength must be at most 100 characters")
  .optional();

const medicationCategorySchema = z
  .string()
  .max(100, "Category must be at most 100 characters")
  .optional();

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

export const createMedicationSchema = z.object({
  name: medicationNameSchema,
  strength: medicationStrengthSchema,
  category: medicationCategorySchema,
});

export const updateMedicationSchema = createMedicationSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const medicationIdParamSchema = z.object({
  id: z.string().uuid("Invalid medication id"),
});

export const listMedicationsQuerySchema = paginationQuerySchema.extend({
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

export const searchMedicationsOnlineQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .min(1, "Search is required")
    .max(255, "Search must be at most 255 characters"),
});

export const lookupMedicationCategoryOnlineQuerySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
});
