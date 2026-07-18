import { Op, UniqueConstraintError } from "sequelize";
import { Doctor, UserClinic, UserDoctor } from "../models";
import {
  buildPaginatedResponse,
  getPaginationParams,
  type PaginationInput,
} from "../lib/pagination";
import { createError } from "../middleware/error-handler";

export interface ListUserDoctorsInput extends PaginationInput {
  userId: string;
  search?: string;
}

export interface CreateUserDoctorInput {
  userId: string;
  doctorId: string;
  userClinicId?: string | null;
  notes?: string | null;
}

export interface UpdateUserDoctorInput {
  userId: string;
  id: string;
  userClinicId?: string | null;
  notes?: string | null;
}

function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

function doctorInclude(search?: string) {
  const trimmed = search?.trim();
  const pattern = trimmed ? `%${escapeLike(trimmed)}%` : undefined;

  return {
    model: Doctor,
    as: "doctor" as const,
    attributes: ["id", "name", "specialty", "phone"],
    required: Boolean(pattern),
    ...(pattern
      ? {
          where: {
            [Op.or]: [
              { name: { [Op.iLike]: pattern } },
              { specialty: { [Op.iLike]: pattern } },
              { phone: { [Op.iLike]: pattern } },
            ],
          },
        }
      : {}),
  };
}

function userClinicInclude() {
  return {
    model: UserClinic,
    as: "userClinic" as const,
    attributes: ["id", "clinicId", "notes"],
    required: false,
  };
}

async function assertDoctorExists(doctorId: string) {
  const doctor = await Doctor.findByPk(doctorId, {
    attributes: ["id"],
  });
  if (!doctor) {
    throw createError("Doctor not found", 404);
  }
}

async function assertUserClinicBelongsToUser(
  userId: string,
  userClinicId: string | null | undefined,
) {
  if (userClinicId == null) return;

  const userClinic = await UserClinic.findOne({
    where: { id: userClinicId, userId },
    attributes: ["id"],
  });

  if (!userClinic) {
    throw createError("User clinic not found", 404);
  }
}

async function findOwnedUserDoctor(userId: string, id: string) {
  const userDoctor = await UserDoctor.findOne({
    where: { id, userId },
    include: [doctorInclude(), userClinicInclude()],
  });

  if (!userDoctor) {
    throw createError("User doctor not found", 404);
  }

  return userDoctor;
}

export class UserDoctorService {
  async list(input: ListUserDoctorsInput) {
    const { currentPage, pageSize, offset, limit } = getPaginationParams(input);

    const { count, rows } = await UserDoctor.findAndCountAll({
      where: { userId: input.userId },
      include: [doctorInclude(input.search), userClinicInclude()],
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
    return findOwnedUserDoctor(userId, id);
  }

  async create(input: CreateUserDoctorInput) {
    await assertDoctorExists(input.doctorId);
    await assertUserClinicBelongsToUser(input.userId, input.userClinicId);

    const existing = await UserDoctor.findOne({
      where: {
        userId: input.userId,
        doctorId: input.doctorId,
      },
      attributes: ["id"],
    });

    if (existing) {
      throw createError("Doctor already linked to profile", 409);
    }

    try {
      const created = await UserDoctor.create({
        userId: input.userId,
        doctorId: input.doctorId,
        userClinicId: input.userClinicId ?? undefined,
        notes: input.notes ?? undefined,
      });

      return findOwnedUserDoctor(input.userId, created.id);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw createError("Doctor already linked to profile", 409);
      }
      throw error;
    }
  }

  async update(input: UpdateUserDoctorInput) {
    const userDoctor = await UserDoctor.findOne({
      where: { id: input.id, userId: input.userId },
    });

    if (!userDoctor) {
      throw createError("User doctor not found", 404);
    }

    if (input.userClinicId !== undefined) {
      await assertUserClinicBelongsToUser(input.userId, input.userClinicId);
      // Sequelize stores SQL NULL; model attrs are typed as string | undefined
      userDoctor.setDataValue(
        "userClinicId",
        input.userClinicId as string | undefined,
      );
    }

    if (input.notes !== undefined) {
      userDoctor.setDataValue("notes", input.notes as string | undefined);
    }

    await userDoctor.save();
    return findOwnedUserDoctor(input.userId, userDoctor.id);
  }

  async remove(userId: string, id: string) {
    const userDoctor = await UserDoctor.findOne({
      where: { id, userId },
    });

    if (!userDoctor) {
      throw createError("User doctor not found", 404);
    }

    userDoctor.active = false;
    await userDoctor.save();

    return { id: userDoctor.id, active: false };
  }
}

export const userDoctorService = new UserDoctorService();
