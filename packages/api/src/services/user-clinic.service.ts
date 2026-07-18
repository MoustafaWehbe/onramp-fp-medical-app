import { Op, UniqueConstraintError } from "sequelize";
import { Clinic, UserClinic } from "../models";
import {
  buildPaginatedResponse,
  getPaginationParams,
  type PaginationInput,
} from "../lib/pagination";
import { createError } from "../middleware/error-handler";

export interface ListUserClinicsInput extends PaginationInput {
  userId: string;
  search?: string;
}

export interface CreateUserClinicInput {
  userId: string;
  clinicId: string;
  notes?: string | null;
}

export interface UpdateUserClinicInput {
  userId: string;
  id: string;
  notes?: string | null;
}

function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

function clinicInclude(search?: string) {
  const trimmed = search?.trim();
  const pattern = trimmed ? `%${escapeLike(trimmed)}%` : undefined;

  return {
    model: Clinic,
    as: "clinic" as const,
    attributes: ["id", "name", "address", "phone"],
    required: Boolean(pattern),
    ...(pattern
      ? {
          where: {
            [Op.or]: [
              { name: { [Op.iLike]: pattern } },
              { address: { [Op.iLike]: pattern } },
              { phone: { [Op.iLike]: pattern } },
            ],
          },
        }
      : {}),
  };
}

async function assertClinicExists(clinicId: string) {
  const clinic = await Clinic.findByPk(clinicId, {
    attributes: ["id"],
  });
  if (!clinic) {
    throw createError("Clinic not found", 404);
  }
}

async function findOwnedUserClinic(userId: string, id: string) {
  const userClinic = await UserClinic.findOne({
    where: { id, userId },
    include: [clinicInclude()],
  });

  if (!userClinic) {
    throw createError("User clinic not found", 404);
  }

  return userClinic;
}

export class UserClinicService {
  async list(input: ListUserClinicsInput) {
    const { currentPage, pageSize, offset, limit } = getPaginationParams(input);

    const { count, rows } = await UserClinic.findAndCountAll({
      where: { userId: input.userId },
      include: [clinicInclude(input.search)],
      order: [
        ["createdAt", "DESC"],
        ["id", "ASC"],
      ],
      limit,
      offset,
      distinct: true,
    });

    return buildPaginatedResponse(rows, count, currentPage, pageSize);
  }

  async getById(userId: string, id: string) {
    return findOwnedUserClinic(userId, id);
  }

  async create(input: CreateUserClinicInput) {
    await assertClinicExists(input.clinicId);

    const existing = await UserClinic.findOne({
      where: {
        userId: input.userId,
        clinicId: input.clinicId,
      },
      attributes: ["id"],
    });

    if (existing) {
      throw createError("Clinic already linked to profile", 409);
    }

    try {
      const created = await UserClinic.create({
        userId: input.userId,
        clinicId: input.clinicId,
        notes: input.notes ?? undefined,
      });

      return findOwnedUserClinic(input.userId, created.id);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw createError("Clinic already linked to profile", 409);
      }
      throw error;
    }
  }

  async update(input: UpdateUserClinicInput) {
    const userClinic = await UserClinic.findOne({
      where: { id: input.id, userId: input.userId },
    });

    if (!userClinic) {
      throw createError("User clinic not found", 404);
    }

    if (input.notes !== undefined) {
      userClinic.setDataValue("notes", input.notes as string | undefined);
    }

    await userClinic.save();
    return findOwnedUserClinic(input.userId, userClinic.id);
  }

  async remove(userId: string, id: string) {
    const userClinic = await UserClinic.findOne({
      where: { id, userId },
    });

    if (!userClinic) {
      throw createError("User clinic not found", 404);
    }

    userClinic.active = false;
    await userClinic.save();

    return { id: userClinic.id, active: false };
  }
}

export const userClinicService = new UserClinicService();
