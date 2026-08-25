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
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
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

function buildDateWhere(dateFrom?: string, dateTo?: string) {
  if (!dateFrom && !dateTo) return undefined;

  const createdAt: Record<symbol, Date> = {};

  if (dateFrom) {
    createdAt[Op.gte] = new Date(`${dateFrom}T00:00:00.000Z`);
  }

  if (dateTo) {
    createdAt[Op.lte] = new Date(`${dateTo}T23:59:59.999Z`);
  }

  return { createdAt };
}

function buildDuplicateWhere(input: CreateDoctorInput): WhereOptions {
  return {
    phone: input.phone,
  };
}

export class DoctorService {
  async list(input: ListDoctorsInput) {
    const { currentPage, pageSize, offset, limit } = getPaginationParams(input);
    const searchWhere = buildSearchWhere(input.search);
    const dateWhere = buildDateWhere(
      input.dateFrom,
      input.dateTo,
    );

    const medications: WhereOptions[] = [];
      if (searchWhere) {
    medications.push(searchWhere);
  }

  if (dateWhere) {
    medications.push(dateWhere);
  }

  const where: WhereOptions =
    medications.length > 0
      ? { [Op.and]: medications }
      : {};

  const sortBy = input.sortBy ?? "name";
  const sortOrder = input.sortOrder ?? "asc";
    const { count, rows } = await Doctor.findAndCountAll({
      attributes: ["id", "name", "specialty", "phone", "createdAt"],
      where,
      order: [
        [
          sortBy,
          sortOrder === "asc" ? "ASC" : "DESC",
        ],
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
