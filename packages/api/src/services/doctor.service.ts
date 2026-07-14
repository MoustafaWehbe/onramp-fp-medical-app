import { Op, UniqueConstraintError, type WhereOptions } from "sequelize";
import { Doctor } from "../models";
import {
  buildPaginatedResponse,
  getPaginationParams,
  type PaginationInput,
} from "../lib/pagination";
import { createError } from "../middleware/error-handler";

export interface ListDoctorsInput extends PaginationInput {
  search?: string;
}

export interface CreateDoctorInput {
  name: string;
  specialty: string;
  phone: string;
}

function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

function buildSearchWhere(search?: string) {
  const trimmed = search?.trim();
  if (!trimmed) return undefined;

  const pattern = `%${escapeLike(trimmed)}%`;

  return {
    [Op.or]: [
      { name: { [Op.iLike]: pattern } },
      { specialty: { [Op.iLike]: pattern } },
      { phone: { [Op.iLike]: pattern } },
    ],
  };
}

function buildDuplicateWhere(input: CreateDoctorInput): WhereOptions {
  return {
    name: input.name,
    phone: input.phone,
  };
}

export class DoctorService {
  async list(input: ListDoctorsInput) {
    const { currentPage, pageSize, offset, limit } = getPaginationParams(input);

    const { count, rows } = await Doctor.findAndCountAll({
      attributes: ["id", "name", "specialty", "phone", "createdAt"],
      where: buildSearchWhere(input.search),
      order: [
        ["name", "ASC"],
        ["specialty", "ASC"],
        ["id", "ASC"],
      ],
      limit,
      offset,
    });

    return buildPaginatedResponse(rows, count, currentPage, pageSize);
  }

  async create(input: CreateDoctorInput) {
    const existing = await Doctor.findOne({
      where: buildDuplicateWhere(input),
    });

    if (existing) {
      throw createError("Doctor already exists", 409);
    }

    try {
      return await Doctor.create(input);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw createError("Doctor already exists", 409);
      }
      throw error;
    }
  }
}

export const doctorService = new DoctorService();
