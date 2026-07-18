import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schemas";
import { CONDITION_STATUSES } from "@starter-kit/shared/db/types/enums";


export const createUserConditionSchema = z.object({
  conditionId: z.string().uuid("Invalid condition id"),

  description: z
    .string()
    .trim()
    .max(5000, "Description must be at most 5000 characters")
    .nullable()
    .optional(),

  diagnosedDate: z
  .string()
  .date("Invalid diagnosed date")
  .refine(
    (date) => new Date(date) <= new Date(),
    {
      message: "Diagnosed date cannot be in the future",
    },
  )
  .nullable()
  .optional(),

  status: z
    .enum(CONDITION_STATUSES)
    .optional(),

  notes: z
    .string()
    .trim()
    .max(5000, "Notes must be at most 5000 characters")
    .nullable()
    .optional(),
});

export const updateUserConditionSchema = z
  .object({
    description: z
      .string()
      .trim()
      .max(5000, "Description must be at most 5000 characters")
      .nullable()
      .optional(),

    diagnosedDate: z
        .string()
        .date("Invalid diagnosed date")
        .refine(
            (date) => new Date(date) <= new Date(),
            {
            message: "Diagnosed date cannot be in the future",
            },
        )
        .nullable()
        .optional(),

    status: z
      .enum(CONDITION_STATUSES)
      .optional(),

    notes: z
      .string()
      .trim()
      .max(5000, "Notes must be at most 5000 characters")
      .nullable()
      .optional(),
  })
  .refine(
    (data) =>
      data.description !== undefined ||
      data.diagnosedDate !== undefined ||
      data.status !== undefined ||
      data.notes !== undefined,
    {
      message: "At least one field is required",
    },
  );

export const userConditionIdParamSchema = z.object({
  id: z.string().uuid("Invalid user condition id"),
});

export const listUserConditionsQuerySchema =
  paginationQuerySchema.extend({
    search: z
      .string()
      .trim()
      .max(255, "Search must be at most 255 characters")
      .optional(),

  });