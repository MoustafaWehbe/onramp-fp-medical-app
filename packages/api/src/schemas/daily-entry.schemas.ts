import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schemas";
import { CONDITION_STATUSES } from "@starter-kit/shared/db/types/enums";

const notesField = z
  .string()
  .trim()
  .max(5000, "Notes must be at most 5000 characters")
  .nullable()
  .optional();

// Compare calendar dates in server-local time so a user's current-day entry is not
// rejected by a UTC-instant comparison (en-CA yields a YYYY-MM-DD string).
const isNotFutureDate = (date: string) =>
  date <= new Date().toLocaleDateString("en-CA");

const entrySymptomItemSchema = z.object({
  userSymptomId: z.string().uuid("Invalid user symptom id"),
  severity: z
    .number()
    .int("Severity must be an integer")
    .min(1, "Severity must be at least 1")
    .max(10, "Severity must be at most 10")
    .nullable()
    .optional(),
  notes: notesField,
});

const entryConditionItemSchema = z.object({
  userConditionId: z.string().uuid("Invalid user condition id"),
  status: z.enum(CONDITION_STATUSES).optional(),
  notes: notesField,
});

const entryMedicationItemSchema = z.object({
  userMedicationId: z.string().uuid("Invalid user medication id"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .optional(),
  unit: z
    .string()
    .trim()
    .min(1, "Unit is required")
    .max(50, "Unit must be at most 50 characters"),
  taken: z.boolean().optional(),
  takenAt: z
    .string()
    .datetime({ offset: true, message: "Invalid takenAt timestamp" })
    .nullable()
    .optional(),
  notes: notesField,
});

const entryDoctorVisitItemSchema = z.object({
  userDoctorId: z.string().uuid("Invalid user doctor id"),
  userClinicId: z.string().uuid("Invalid user clinic id").nullable().optional(),
  summary: z
    .string()
    .trim()
    .max(5000, "Summary must be at most 5000 characters")
    .nullable()
    .optional(),
  notes: notesField,
});

const entryScalarFields = {
  moodRating: z
    .number()
    .int("Mood rating must be an integer")
    .min(1, "Mood rating must be at least 1")
    .max(5, "Mood rating must be at most 5")
    .nullable()
    .optional(),
  sleepHours: z
    .number()
    .min(0, "Sleep hours must be at least 0")
    .max(24, "Sleep hours must be at most 24")
    .nullable()
    .optional(),
  journalNotes: z
    .string()
    .trim()
    .max(10000, "Journal notes must be at most 10000 characters")
    .nullable()
    .optional(),
};

const entryChildArrays = {
  symptoms: z.array(entrySymptomItemSchema).optional(),
  conditions: z.array(entryConditionItemSchema).optional(),
  medications: z.array(entryMedicationItemSchema).optional(),
  doctorVisits: z.array(entryDoctorVisitItemSchema).optional(),
};

export const createDailyEntrySchema = z.object({
  entryDate: z
    .string()
    .date("Invalid entry date")
    .refine(isNotFutureDate, {
      message: "Entry date cannot be in the future",
    }),
  ...entryScalarFields,
  ...entryChildArrays,
});

export const updateDailyEntrySchema = z
  .object({
    entryDate: z
      .string()
      .date("Invalid entry date")
      .refine(isNotFutureDate, {
        message: "Entry date cannot be in the future",
      })
      .optional(),
    ...entryScalarFields,
    ...entryChildArrays,
  })
  .refine(
    (data) =>
      data.entryDate !== undefined ||
      data.moodRating !== undefined ||
      data.sleepHours !== undefined ||
      data.journalNotes !== undefined ||
      data.symptoms !== undefined ||
      data.conditions !== undefined ||
      data.medications !== undefined ||
      data.doctorVisits !== undefined,
    {
      message: "At least one field is required",
    },
  );

export const dailyEntryIdParamSchema = z.object({
  id: z.string().uuid("Invalid daily entry id"),
});

export const listDailyEntriesQuerySchema = paginationQuerySchema
  .extend({
    fromDate: z.string().date("Invalid from date").optional(),
    toDate: z.string().date("Invalid to date").optional(),
  })
  .refine(
    (data) =>
      data.fromDate === undefined ||
      data.toDate === undefined ||
      new Date(data.fromDate) <= new Date(data.toDate),
    {
      message: "fromDate must be before or equal to toDate",
    },
  );
