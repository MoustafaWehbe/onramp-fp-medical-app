import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schemas"; 

const conditionNameSchema = z
  .string()
  .min(1, "Name is required")
  .max(255, "Name must be at most 255 characters");

export const createConditionSchema = z.object({
  name: conditionNameSchema,
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
  
export const listConditionsQuerySchema = paginationQuerySchema.extend({
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
  
  export const searchConditionsOnlineQuerySchema = z.object({
    search: z
      .string()
      .trim()
      .min(1, "Search is required")
      .max(255, "Search must be at most 255 characters"),
  });

  export const conditionIdParamSchema = z.object({
  id: z.string().uuid("Invalid condition id"),
});

