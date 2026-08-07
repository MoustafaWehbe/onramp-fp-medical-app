import { z } from "zod";

import type { ConditionStatus } from "../health/condition-status";

import type {
  CreateDailyEntryRequest,
  DailyEntry,
  DailyEntryConditionRequest,
  DailyEntryDoctorVisitRequest,
  DailyEntryMedicationRequest,
  DailyEntrySymptomRequest,
  UpdateDailyEntryRequest,
} from "./types";
import { MEDICATION_UNITS } from "../health/health-export";

/**
 * ----------------------------------------------------
 * Nested Form Schemas
 * ----------------------------------------------------
 */

const dailyEntrySymptomFormSchema = z.object({
  userSymptomId: z
    .string()
    .min(1, "Symptom is required"),

  severity: z
    .string()
    .min(1, "Severity is required")
    .refine(
      (value) => {
        const number = Number(value);

        return (
          Number.isInteger(number) &&
          number >= 1 &&
          number <= 10
        );
      },
      {
        message:
          "Severity must be a whole number between 1 and 10",
      },
    ),

  notes: z
    .string()
    .max(
      2000,
      "Symptom notes must be 2000 characters or less",
    )
    .optional(),
});

const dailyEntryMedicationFormSchema = z.object({
  userMedicationId: z
    .string()
    .min(1, "Medication is required"),

  quantity: z
    .string()
    .min(1, "Quantity is required")
    .refine(
      (value) => {
        const number = Number(value);

        return (
          Number.isInteger(number) &&
          number > 0
        );
      },
      {
        message:
          "Quantity must be a whole number greater than 0",
      },
    ),

unit: z.union([
  z.enum(MEDICATION_UNITS),
  z.literal(""),
]).refine(
  (value) => value !== "",
  {
    message: "Unit is required",
  }
),
    

  taken: z.boolean(),

  takenAt: z
    .string()
    .optional(),

  notes: z
    .string()
    .max(
      2000,
      "Medication notes must be 2000 characters or less",
    )
    .optional(),
});

const dailyEntryConditionFormSchema = z.object({
  userConditionId: z
    .string()
    .min(1, "Condition is required"),

  status: z.enum(
    ["active", "inactive", "resolved"] as const,
  ),

  notes: z
    .string()
    .max(
      2000,
      "Condition notes must be 2000 characters or less",
    )
    .optional(),
});

const dailyEntryDoctorVisitFormSchema = z.object({
  userDoctorId: z
    .string()
    .min(1, "Doctor is required"),

  userClinicId: z
    .string()
    .min(1, "Clinic is required"),

  summary: z
    .string()
    .min(1, "Summary is required")
    .max(
      2000,
      "Summary must be 2000 characters or less",
    ),

  notes: z
    .string()
    .max(
      2000,
      "Visit notes must be 2000 characters or less",
    )
    .optional(),
});

/**
 * ----------------------------------------------------
 * Main Daily Entry Form Schema
 * ----------------------------------------------------
 *
 * entryDate is automatically set to today's date.
 *
 * The UI should display it as read-only.
 * The user must not be able to change it.
 */

export const dailyEntryFormSchema = z.object({
  entryDate: z
    .string()
    .min(1, "Date is required"),

  moodRating: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value || !value.trim()) {
          return true;
        }

        const number = Number(value);

        return (
          Number.isInteger(number) &&
          number >= 1 &&
          number <= 5
        );
      },
      {
        message:
          "Mood rating must be a whole number between 1 and 5",
      },
    ),

  sleepHours: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value || !value.trim()) {
          return true;
        }

        const number = Number(value);

        return (
          Number.isFinite(number) &&
          number >= 0 &&
          number <= 24
        );
      },
      {
        message:
          "Sleep hours must be between 0 and 24",
      },
    ),

  journalNotes: z
    .string()
    .max(
      5000,
      "Journal notes must be 5000 characters or less",
    )
    .optional(),

  symptoms: z.array(
    dailyEntrySymptomFormSchema,
  ),

  medications: z.array(
    dailyEntryMedicationFormSchema,
  ),

  conditions: z.array(
    dailyEntryConditionFormSchema,
  ),

  doctorVisits: z.array(
    dailyEntryDoctorVisitFormSchema,
  ),
});

export type DailyEntryFormValues =
  z.infer<typeof dailyEntryFormSchema>;

/**
 * ----------------------------------------------------
 * Form Submit Payload
 * ----------------------------------------------------
 */

export interface DailyEntryFormSubmitPayload {
  entryDate: string;

  moodRating?: number | null;

  sleepHours?: number | null;

  journalNotes?: string | null;

  symptoms: DailyEntrySymptomRequest[];

  medications: DailyEntryMedicationRequest[];

  conditions: DailyEntryConditionRequest[];

  doctorVisits: DailyEntryDoctorVisitRequest[];
}

/**
 * ----------------------------------------------------
 * Today's Date
 * ----------------------------------------------------
 *
 * Returns today's date in YYYY-MM-DD format.
 *
 * Example:
 * 2026-07-28
 */

export function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTimeOnly(
  dateString: string,
): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function buildTodayDateTime(
  time: string,
): string {
  const today = new Date();

  const [hours, minutes] =
    time.split(":");

  today.setHours(
    Number(hours),
    Number(minutes),
    0,
    0,
  );

  return today.toISOString();
}

/**
 * ----------------------------------------------------
 * Empty Form Values
 * ----------------------------------------------------
 *
 * Used when opening "Submit Current Entry".
 *
 * The entry date is automatically today's date.
 */

export function emptyDailyEntryFormValues(): DailyEntryFormValues {
  return {
    entryDate: getTodayDate(),

    moodRating: "",

    sleepHours: "",

    journalNotes: "",

    symptoms: [],

    medications: [],

    conditions: [],

    doctorVisits: [],
  };
}

/**
 * ----------------------------------------------------
 * Existing Entry -> Form Values
 * ----------------------------------------------------
 *
 * Used when editing an existing entry.
 *
 * NOTE:
 * For the current UI flow, the user should only use
 * emptyDailyEntryFormValues() when creating today's entry.
 *
 * This function is kept for future edit functionality.
 */

export function toDailyEntryFormValues(
  initial?: DailyEntry | null,
): DailyEntryFormValues {
  if (!initial) {
    return emptyDailyEntryFormValues();
  }

  return {
    entryDate: initial.entryDate,

    moodRating:
      initial.moodRating !== null
        ? String(initial.moodRating)
        : "",

    sleepHours:
      initial.sleepHours !== null
        ? String(initial.sleepHours)
        : "",

    journalNotes:
      initial.journalNotes ?? "",

    symptoms:
      initial.symptoms.map((symptom) => ({
        userSymptomId:
          symptom.userSymptomId,

        severity:
          String(symptom.severity),

        notes:
          symptom.notes ?? "",
      })),

    medications:
      // cast to any to satisfy differing unit typing between initial and target types
      initial.medications.map((medication) => ({
        userMedicationId:
          medication.userMedicationId,

        quantity:
          String(medication.quantity),

        unit:
         MEDICATION_UNITS.includes(
          medication.unit as any
        )
          ? (medication.unit as typeof MEDICATION_UNITS[number])
          : ("" as const),

        taken:
          medication.taken,

        takenAt:
          medication.takenAt
          ? toTimeOnly(
              medication.takenAt,
            )
          : "",

        notes:
          medication.notes ?? "",
      })) as any,

    conditions:
      initial.conditions.map((condition) => ({
        userConditionId:
          condition.userConditionId,

        status:
          condition.status,

        notes:
          condition.notes ?? "",
      })),

    doctorVisits:
      initial.doctorVisits.map((visit) => ({
        userDoctorId:
          visit.userDoctorId,

        userClinicId:
          visit.userClinicId,

        summary:
          visit.summary,

        notes:
          visit.notes ?? "",
      })),
  };
}

/**
 * ----------------------------------------------------
 * ISO Date -> datetime-local
 * ----------------------------------------------------
 */

function toDateTimeLocal(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, "0");

  const day =
    String(
      date.getDate(),
    ).padStart(2, "0");

  const hours =
    String(
      date.getHours(),
    ).padStart(2, "0");

  const minutes =
    String(
      date.getMinutes(),
    ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * ----------------------------------------------------
 * Form Values -> Submit Payload
 * ----------------------------------------------------
 *
 * IMPORTANT:
 * For a new daily entry, the entry date is ALWAYS
 * today's date.
 *
 * The value from the form is not used to determine
 * the date sent to the backend.
 */

export function toDailyEntrySubmitPayload(
  values: DailyEntryFormValues,
): DailyEntryFormSubmitPayload {
  const hasMoodRating =
    Boolean(
      values.moodRating?.trim(),
    );

  const hasSleepHours =
    Boolean(
      values.sleepHours?.trim(),
    );

  return {
    /**
     * Always submit today's date.
     */
    entryDate: values.entryDate,

    moodRating:
      hasMoodRating
        ? Number(values.moodRating)
        : null,

    sleepHours:
      hasSleepHours
        ? Number(values.sleepHours)
        : null,

    journalNotes:
      values.journalNotes?.trim()
        ? values.journalNotes.trim()
        : null,

    symptoms:
      values.symptoms.map(
        (symptom) => ({
          userSymptomId:
            symptom.userSymptomId,

          severity:
            Number(symptom.severity),

          notes:
            symptom.notes?.trim()
              ? symptom.notes.trim()
              : null,
        }),
      ),

    medications:
      values.medications.map(
        (medication) => ({
          userMedicationId:
            medication.userMedicationId,

          quantity:
            Number(medication.quantity),

          unit:
            medication.unit.trim(),

          taken:
            medication.taken,

          takenAt:
            medication.takenAt?.trim()
            ? buildTodayDateTime(
                medication.takenAt,
              )
            : null,

          notes:
            medication.notes?.trim()
              ? medication.notes.trim()
              : null,
        }),
      ),

    conditions:
      values.conditions.map(
        (condition) => ({
          userConditionId:
            condition.userConditionId,

          status:
            condition.status as ConditionStatus,

          notes:
            condition.notes?.trim()
              ? condition.notes.trim()
              : null,
        }),
      ),

    doctorVisits:
      values.doctorVisits.map(
        (visit) => ({
          userDoctorId:
            visit.userDoctorId,

          userClinicId:
            visit.userClinicId,

          summary:
            visit.summary.trim(),

          notes:
            visit.notes?.trim()
              ? visit.notes.trim()
              : null,
        }),
      ),
  };
}

/**
 * ----------------------------------------------------
 * Submit Payload -> Create Request
 * ----------------------------------------------------
 */

export function toCreateDailyEntryRequest(
  payload: DailyEntryFormSubmitPayload,
): CreateDailyEntryRequest {
  return {
    entryDate:
      payload.entryDate,

    moodRating:
      payload.moodRating,

    sleepHours:
      payload.sleepHours,

    journalNotes:
      payload.journalNotes,

    symptoms:
      payload.symptoms,

    medications:
      payload.medications,

    conditions:
      payload.conditions,

    doctorVisits:
      payload.doctorVisits,
  };
}

/**
 * ----------------------------------------------------
 * Submit Payload -> Update Request
 * ----------------------------------------------------
 *
 */

export function toUpdateDailyEntryRequest(
  payload: DailyEntryFormSubmitPayload,
): UpdateDailyEntryRequest {
  return {
    entryDate:
      payload.entryDate,

    moodRating:
      payload.moodRating,

    sleepHours:
      payload.sleepHours,

    journalNotes:
      payload.journalNotes,

    symptoms:
      payload.symptoms,

    medications:
      payload.medications,

    conditions:
      payload.conditions,

    doctorVisits:
      payload.doctorVisits,
  };
}