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
});

export const listSymptomsQuerySchema = paginationQuerySchema.extend({
  search: z
    .string()
    .trim()
    .max(255, "Search must be at most 255 characters")
    .optional(),
});

export const searchSymptomsOnlineQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .min(1, "Search is required")
    .max(255, "Search must be at most 255 characters"),
});
