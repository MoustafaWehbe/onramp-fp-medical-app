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

