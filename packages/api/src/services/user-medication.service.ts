import { Op, UniqueConstraintError } from "sequelize";
import { Medication, UserMedication } from "../models";
import {
  buildPaginatedResponse,
  getPaginationParams,
  type PaginationInput,
} from "../lib/pagination";
import { createError } from "../middleware/error-handler";
import type { DosageMeasurement } from "../../../shared/db/types/enums";

export interface ListUserMedicationsInput extends PaginationInput {
  userId: string;
  search?: string;
}

export interface CreateUserMedicationInput {
  userId: string;
  medicationId: string;
  dosage?: number | null;
  dosageMeasurement?: DosageMeasurement | null;
  frequency?: string | null;
  notes?: string | null;
}

export interface UpdateUserMedicationInput {
  userId: string;
  id: string;
  dosage?: number | null;
  dosageMeasurement?: DosageMeasurement | null;
  frequency?: string | null;
  notes?: string | null;
}

function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

function medicationInclude(search?: string) {
  const trimmed = search?.trim();
  const pattern = trimmed ? `%${escapeLike(trimmed)}%` : undefined;

  return {
    model: Medication,
    as: "medication" as const,
    attributes: ["id", "name", "strength", "category"],
    required: Boolean(pattern),
    ...(pattern
      ? {
          where: {
            name: {
              [Op.iLike]: pattern,
            },
          },
        }
      : {}),
  };
}

async function assertMedicationExists(medicationId: string) {
  const medication = await Medication.findByPk(medicationId, {
    attributes: ["id"],
  });

  if (!medication) {
    throw createError("Medication not found", 404);
  }
}

async function findOwnedUserMedication(userId: string, id: string) {
  const userMedication = await UserMedication.findOne({
    where: {
      id,
      userId,
    },
    include: [medicationInclude()],
  });

  if (!userMedication) {
    throw createError("User medication not found", 404);
  }

  return userMedication;
}

export class UserMedicationService {
  async list(input: ListUserMedicationsInput) {
    const { currentPage, pageSize, offset, limit } =
      getPaginationParams(input);

    const { count, rows } = await UserMedication.findAndCountAll({
      where: {
        userId: input.userId,
      },
      include: [medicationInclude(input.search)],
      order: [
        ["createdAt", "DESC"],
        ["id", "ASC"],
      ],
      limit,
      offset,
      distinct: true,
    });

    return buildPaginatedResponse(
      rows,
      count,
      currentPage,
      pageSize,
    );
  }

  async getById(userId: string, id: string) {
    return findOwnedUserMedication(userId, id);
  }

  async create(input: CreateUserMedicationInput) {
    await assertMedicationExists(input.medicationId);

    const existing = await UserMedication.findOne({
      where: {
        userId: input.userId,
        medicationId: input.medicationId,
      },
      attributes: ["id"],
    });

    if (existing) {
      throw createError(
        "Medication already linked to profile",
        409,
      );
    }

    try {
      const created = await UserMedication.create({
        userId: input.userId,
        medicationId: input.medicationId,
        dosage: input.dosage ?? undefined,
        dosageMeasurement:
          input.dosageMeasurement ?? undefined,
        frequency: input.frequency ?? undefined,
        notes: input.notes ?? undefined,
      });

      return findOwnedUserMedication(
        input.userId,
        created.id,
      );
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw createError(
          "Medication already linked to profile",
          409,
        );
      }

      throw error;
    }
  }

  async update(input: UpdateUserMedicationInput) {
    const userMedication = await UserMedication.findOne({
      where: {
        id: input.id,
        userId: input.userId,
      },
    });

    if (!userMedication) {
      throw createError(
        "User medication not found",
        404,
      );
    }

    if (input.dosage !== undefined) {
      userMedication.setDataValue(
        "dosage",
        input.dosage as number | undefined,
      );
    }

    if (input.dosageMeasurement !== undefined) {
      userMedication.setDataValue(
        "dosageMeasurement",
        input.dosageMeasurement as DosageMeasurement | undefined,
      );
    }

    if (input.frequency !== undefined) {
      userMedication.setDataValue(
        "frequency",
        input.frequency as string | undefined,
      );
    }

    if (input.notes !== undefined) {
      userMedication.setDataValue(
        "notes",
        input.notes as string | undefined,
      );
    }

    await userMedication.save();

    return findOwnedUserMedication(
      input.userId,
      userMedication.id,
    );
  }

  async remove(userId: string, id: string) {
    const userMedication = await UserMedication.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!userMedication) {
      throw createError(
        "User medication not found",
        404,
      );
    }

    userMedication.active = false;
    await userMedication.save();

    return {
      id: userMedication.id,
      active: false,
    };
  }
}

export const userMedicationService =
  new UserMedicationService();