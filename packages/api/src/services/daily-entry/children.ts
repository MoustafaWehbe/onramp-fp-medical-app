import { Op, UniqueConstraintError, type Transaction } from "sequelize";
import {
  EntryCondition,
  EntryDoctorVisit,
  EntryMedication,
  EntrySymptom,
  UserCondition,
} from "../../models";
import { createError } from "../../middleware/error-handler";
import type {
  CreateDailyEntryInput,
  EntryConditionInput,
  UpdateDailyEntryInput,
} from "./types";

export function rethrowUnique(error: unknown, message: string): never {
  if (error instanceof UniqueConstraintError) {
    throw createError(message, 409);
  }
  throw error;
}

export async function reconcileConditions(
  entryId: string,
  conditions: EntryConditionInput[],
  transaction: Transaction,
) {
  const existing = await EntryCondition.findAll({
    where: { entryId },
    transaction,
  });
  const existingByUserConditionId = new Map(
    existing.map((row) => [row.userConditionId, row]),
  );
  const submittedIds = new Set(
    conditions.map((condition) => condition.userConditionId),
  );

  for (const condition of conditions) {
    const row = existingByUserConditionId.get(condition.userConditionId);
    if (row) {
      await row.update(
        {
          status: row.status === "resolved" ? "resolved" : "active",
          notes: condition.notes,
        },
        { transaction },
      );
      continue;
    }
    try {
      await EntryCondition.create(
        {
          entryId,
          userConditionId: condition.userConditionId,
          status: "active",
          notes: condition.notes ?? undefined,
        },
        { transaction, validate: true },
      );
    } catch (error) {
      rethrowUnique(error, "Duplicate condition for this entry");
    }
  }

  const removedIds = existing
    .filter((row) => !submittedIds.has(row.userConditionId))
    .map((row) => row.userConditionId);

  for (const row of existing) {
    if (
      !submittedIds.has(row.userConditionId) &&
      row.status !== "resolved"
    ) {
      await row.update({ status: "inactive" }, { transaction });
    }
  }

  if (conditions.length) {
    await UserCondition.update(
      { status: "active" },
      {
        where: {
          id: [...submittedIds],
          status: { [Op.in]: ["active", "inactive"] },
        },
        transaction,
      },
    );
  }

  if (removedIds.length) {
    await UserCondition.update(
      { status: "inactive" },
      { where: { id: removedIds, status: "active" }, transaction },
    );
  }
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
