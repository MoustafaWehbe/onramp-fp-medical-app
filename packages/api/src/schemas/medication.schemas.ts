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
