import { type Model, type ModelStatic, type Transaction } from "sequelize";
import {
  UserClinic,
  UserCondition,
  UserDoctor,
  UserMedication,
  UserSymptom,
} from "../../models";
import { createError } from "../../middleware/error-handler";
import type { CreateDailyEntryInput, UpdateDailyEntryInput } from "./types";

export async function assertOwnedIds(
  model: ModelStatic<Model>,
  userId: string,
  ids: string[],
  label: string,
  transaction: Transaction,
) {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return;

  const rows = await model.findAll({
    where: { id: uniqueIds, userId },
    attributes: ["id"],
    transaction,
  });

  if (rows.length !== uniqueIds.length) {
    throw createError(`${label} not found`, 404);
  }
}

export async function assertOwnedReferences(
  input: CreateDailyEntryInput | UpdateDailyEntryInput,
  userId: string,
  transaction: Transaction,
) {
  await assertOwnedIds(
    UserSymptom as unknown as ModelStatic<Model>,
    userId,
    input.symptoms?.map((s) => s.userSymptomId) ?? [],
    "User symptom",
    transaction,
  );
  await assertOwnedIds(
    UserCondition as unknown as ModelStatic<Model>,
    userId,
    input.conditions?.map((c) => c.userConditionId) ?? [],
    "User condition",
    transaction,
  );
  await assertOwnedIds(
    UserMedication as unknown as ModelStatic<Model>,
    userId,
    input.medications?.map((m) => m.userMedicationId) ?? [],
    "User medication",
    transaction,
  );
  await assertOwnedIds(
    UserDoctor as unknown as ModelStatic<Model>,
    userId,
    input.doctorVisits?.map((v) => v.userDoctorId) ?? [],
    "User doctor",
    transaction,
  );
  await assertOwnedIds(
    UserClinic as unknown as ModelStatic<Model>,
    userId,
    input.doctorVisits
      ?.map((v) => v.userClinicId)
      .filter((id): id is string => Boolean(id)) ?? [],
    "User clinic",
    transaction,
  );
}
