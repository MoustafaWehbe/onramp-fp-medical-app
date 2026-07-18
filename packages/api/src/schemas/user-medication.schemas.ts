import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schemas";
import { DOSAGE_MEASUREMENTS } from "../../../shared/db/types/enums";

export const createUserMedicationSchema = z
  .object({
    medicationId: z.string().uuid("Invalid medication id"),

    dosage: z
      .number()
      .positive("Dosage must be greater than 0")
      .nullable()
      .optional(),

    dosageMeasurement: z
      .enum(DOSAGE_MEASUREMENTS)
      .nullable()
      .optional(),

    frequency: z
      .string()
      .trim()
      .max(100, "Frequency must be at most 100 characters")
      .nullable()
      .optional(),

    notes: z
      .string()
      .trim()
      .max(5000, "Notes must be at most 5000 characters")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      const hasDosage = data.dosage !== null && data.dosage !== undefined;
      const hasMeasurement =
        data.dosageMeasurement !== null &&
        data.dosageMeasurement !== undefined;

      return hasDosage === hasMeasurement;
    },
    {
      message:
        "Dosage and dosage measurement must be provided together",
    },
  );

  export const updateUserMedicationSchema = z
  .object({
    dosage: z
      .number()
      .positive("Dosage must be greater than 0")
      .nullable()
      .optional(),

    dosageMeasurement: z
      .enum(DOSAGE_MEASUREMENTS)
      .nullable()
      .optional(),

    frequency: z
      .string()
      .trim()
      .max(100, "Frequency must be at most 100 characters")
      .nullable()
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
      data.dosage !== undefined ||
      data.dosageMeasurement !== undefined ||
      data.frequency !== undefined ||
      data.notes !== undefined,
    {
      message: "At least one field is required",
    },
  )
  .refine(
    (data) => {
      const hasDosage = data.dosage !== null && data.dosage !== undefined;
      const hasMeasurement =
        data.dosageMeasurement !== null &&
        data.dosageMeasurement !== undefined;

      return hasDosage === hasMeasurement;
    },
    {
      message:
        "Dosage and dosage measurement must be provided together",
    },
  );

  export const userMedicationIdParamSchema = z.object({
  id: z.string().uuid("Invalid user medication id"),
});

export const listUserMedicationsQuerySchema =
  paginationQuerySchema.extend({
    search: z
      .string()
      .trim()
      .max(255, "Search must be at most 255 characters")
      .optional(),
  });