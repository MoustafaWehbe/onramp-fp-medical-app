import { z } from "zod";
import { DOSAGE_MEASUREMENTS } from "../dosage";
import type { UserMedication } from "./types";

const dosageMeasurementSchema = z.enum(DOSAGE_MEASUREMENTS);

export const medicationFormSchema = z
  .object({
    nameQuery: z.string().min(1, "Select a medication"),
    medicationId: z
      .string()
      .uuid("Select a medication from the list")
      .optional(),
    onlineName: z.string().optional(),
    dosage: z.string().optional(),
    dosageMeasurement: z
      .union([dosageMeasurementSchema, z.literal("")])
      .optional(),
    frequency: z.string().max(100).optional(),
    notes: z.string().max(5000).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.medicationId && !data.onlineName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a medication from the suggestions",
        path: ["nameQuery"],
      });
    }

    const hasDosage = Boolean(data.dosage?.trim());
    const hasMeasurement = Boolean(data.dosageMeasurement);

    if (hasDosage !== hasMeasurement) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dosage and unit must be provided together",
        path: hasDosage ? ["dosageMeasurement"] : ["dosage"],
      });
    }

    if (hasDosage) {
      const n = Number(data.dosage);
      if (!Number.isFinite(n) || n <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Dosage must be greater than 0",
          path: ["dosage"],
        });
      }
    }
  });

export type MedicationFormValues = z.infer<typeof medicationFormSchema>;

export interface MedicationFormSubmitPayload {
  medicationId?: string;
  onlineName?: string;
  dosage?: number | null;
  dosageMeasurement?: (typeof DOSAGE_MEASUREMENTS)[number] | null;
  frequency?: string | null;
  notes?: string | null;
}

export function emptyMedicationFormValues(): MedicationFormValues {
  return {
    nameQuery: "",
    medicationId: undefined,
    onlineName: undefined,
    dosage: "",
    dosageMeasurement: "",
    frequency: "",
    notes: "",
  };
}

export function toMedicationFormValues(
  initial?: UserMedication | null,
): MedicationFormValues {
  if (!initial) return emptyMedicationFormValues();

  return {
    nameQuery: initial.medication.name,
    medicationId: initial.medicationId,
    onlineName: undefined,
    dosage: initial.dosage != null ? String(initial.dosage) : "",
    dosageMeasurement: initial.dosageMeasurement ?? "",
    frequency: initial.frequency ?? "",
    notes: initial.notes ?? "",
  };
}

export function toMedicationSubmitPayload(
  values: MedicationFormValues,
): MedicationFormSubmitPayload {
  const hasDosage = Boolean(values.dosage?.trim());
  const dosage = hasDosage ? Number(values.dosage) : null;
  const dosageMeasurement = hasDosage
    ? (values.dosageMeasurement as (typeof DOSAGE_MEASUREMENTS)[number])
    : null;

  return {
    medicationId: values.medicationId,
    onlineName: values.onlineName,
    dosage,
    dosageMeasurement,
    frequency: values.frequency?.trim() ? values.frequency.trim() : null,
    notes: values.notes?.trim() ? values.notes.trim() : null,
  };
}

export function formatMedicationDosage(
  med: Pick<UserMedication, "dosage" | "dosageMeasurement">,
): string | null {
  if (med.dosage == null || !med.dosageMeasurement) return null;
  return `${med.dosage} ${med.dosageMeasurement}`;
}
