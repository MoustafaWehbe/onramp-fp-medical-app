import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schemas"; 

const conditionNameSchema = z
  .string()
  .min(1, "Name is required")
  .max(255, "Name must be at most 255 characters");

export const createConditionSchema = z.object({
  name: conditionNameSchema,
});
  
export const listConditionsQuerySchema = paginationQuerySchema.extend({
  search: z
    .string()
    .trim()
    .max(255, "Search must be at most 255 characters")
    .optional(),
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

