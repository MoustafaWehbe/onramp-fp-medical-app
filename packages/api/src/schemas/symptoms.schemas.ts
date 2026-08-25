import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schemas";

const symptomNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(255, "Name must be at most 255 characters");

const symptomCategorySchema = z
  .string()
  .max(100, "Category must be at most 100 characters")
  .optional();

export const createSymptomSchema = z.object({
  name: symptomNameSchema,
  category: symptomCategorySchema,
  isCustom: z.boolean().optional().default(false),
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

export const listSymptomsQuerySchema = paginationQuerySchema.extend({
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

export const searchSymptomsOnlineQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .min(1, "Search is required")
    .max(255, "Search must be at most 255 characters"),
});
