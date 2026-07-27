import { z } from "zod";
import type {
  CreateDailyEntryRequest,
  DailyEntry,
  UpdateDailyEntryRequest,
} from "./types";

/**
 * Schema for the daily entry form.
 *
 * Form values use strings for numeric inputs because
 * HTML input elements return string values.
 */
export const dailyEntryFormSchema = z.object({
  entryDate: z.string().min(1, "Date is required"),

  moodRating: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value || !value.trim()) return true;

        const number = Number(value);

        return (
          Number.isInteger(number) &&
          number >= 1 &&
          number <= 10
        );
      },
      {
        message: "Mood rating must be a whole number between 1 and 10",
      },
    ),

  sleepHours: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value || !value.trim()) return true;

        const number = Number(value);

        return Number.isFinite(number) && number >= 0;
      },
      {
        message: "Sleep hours must be 0 or greater",
      },
    ),

  journalNotes: z
    .string()
    .max(5000, "Journal notes must be 5000 characters or less")
    .optional(),
});

export type DailyEntryFormValues = z.infer<
  typeof dailyEntryFormSchema
>;

/**
 * Internal payload used when submitting
 * the daily entry form.
 */
export interface DailyEntryFormSubmitPayload {
  entryDate: string;
  moodRating?: number | null;
  sleepHours?: number | null;
  journalNotes?: string | null;
}

/**
 * Returns empty/default values for creating
 * a new daily entry.
 */
export function emptyDailyEntryFormValues(): DailyEntryFormValues {
  return {
    entryDate: new Date().toISOString().split("T")[0],
    moodRating: "",
    sleepHours: "",
    journalNotes: "",
  };
}

/**
 * Converts an existing DailyEntry into form values.
 *
 * Used when editing an existing daily entry.
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
      initial.moodRating != null
        ? String(initial.moodRating)
        : "",
    sleepHours:
      initial.sleepHours != null
        ? String(initial.sleepHours)
        : "",
    journalNotes: initial.journalNotes ?? "",
  };
}

/**
 * Converts form values into a clean submit payload.
 */
export function toDailyEntrySubmitPayload(
  values: DailyEntryFormValues,
): DailyEntryFormSubmitPayload {
  const hasMoodRating = Boolean(values.moodRating?.trim());
  const hasSleepHours = Boolean(values.sleepHours?.trim());

  return {
    entryDate: values.entryDate,

    moodRating: hasMoodRating
      ? Number(values.moodRating)
      : null,

    sleepHours: hasSleepHours
      ? Number(values.sleepHours)
      : null,

    journalNotes: values.journalNotes?.trim()
      ? values.journalNotes.trim()
      : null,
  };
}

/**
 * Converts the form payload into the request
 * used to create a daily entry.
 */
export function toCreateDailyEntryRequest(
  payload: DailyEntryFormSubmitPayload,
): CreateDailyEntryRequest {
  return {
    entryDate: payload.entryDate,
    moodRating: payload.moodRating,
    sleepHours: payload.sleepHours,
    journalNotes: payload.journalNotes,
  };
}

/**
 * Converts the form payload into the request
 * used to update a daily entry.
 */
export function toUpdateDailyEntryRequest(
  payload: DailyEntryFormSubmitPayload,
): UpdateDailyEntryRequest {
  return {
    entryDate: payload.entryDate,
    moodRating: payload.moodRating,
    sleepHours: payload.sleepHours,
    journalNotes: payload.journalNotes,
  };
}