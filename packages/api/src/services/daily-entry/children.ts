import { UniqueConstraintError, type Transaction } from "sequelize";
import {
  EntryCondition,
  EntryDoctorVisit,
  EntryMedication,
  EntrySymptom,
} from "../../models";
import { createError } from "../../middleware/error-handler";
import type { CreateDailyEntryInput, UpdateDailyEntryInput } from "./types";

export function rethrowUnique(error: unknown, message: string): never {
  if (error instanceof UniqueConstraintError) {
    throw createError(message, 409);
  }
  throw error;
}

export async function insertChildren(
  entryId: string,
  input: CreateDailyEntryInput | UpdateDailyEntryInput,
  transaction: Transaction,
) {
  if (input.symptoms?.length) {
    try {
      await EntrySymptom.bulkCreate(
        input.symptoms.map((s) => ({
          entryId,
          userSymptomId: s.userSymptomId,
          severity: s.severity ?? undefined,
          notes: s.notes ?? undefined,
        })),
        { transaction, validate: true },
      );
    } catch (error) {
      rethrowUnique(error, "Duplicate symptom for this entry");
    }
  }

  if (input.conditions?.length) {
    try {
      await EntryCondition.bulkCreate(
        input.conditions.map((c) => ({
          entryId,
          userConditionId: c.userConditionId,
          status: c.status,
          notes: c.notes ?? undefined,
        })),
        { transaction, validate: true },
      );
    } catch (error) {
      rethrowUnique(error, "Duplicate condition for this entry");
    }
  }

  if (input.medications?.length) {
    try {
      await EntryMedication.bulkCreate(
        input.medications.map((m) => ({
          entryId,
          userMedicationId: m.userMedicationId,
          quantity: m.quantity ?? undefined,
          unit: m.unit,
          taken: m.taken ?? undefined,
          takenAt: m.takenAt ? new Date(m.takenAt) : undefined,
          notes: m.notes ?? undefined,
        })),
        { transaction, validate: true },
      );
    } catch (error) {
      rethrowUnique(error, "Duplicate medication for this entry");
    }
  }

  if (input.doctorVisits?.length) {
    try {
      await EntryDoctorVisit.bulkCreate(
        input.doctorVisits.map((v) => ({
          entryId,
          userDoctorId: v.userDoctorId,
          userClinicId: v.userClinicId ?? undefined,
          summary: v.summary ?? undefined,
          notes: v.notes ?? undefined,
        })),
        { transaction, validate: true },
      );
    } catch (error) {
      rethrowUnique(error, "Duplicate doctor visit for this entry");
    }
  }
}
