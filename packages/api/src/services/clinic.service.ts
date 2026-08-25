import { Op, UniqueConstraintError, type WhereOptions } from "sequelize";
import { Clinic } from "../models";
import {
  buildPaginatedResponse,
  getPaginationParams,
  type PaginationInput,
} from "../lib/pagination";
import { createError } from "../middleware/error-handler";

export interface ListClinicsInput extends PaginationInput {
  search?: string;
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateClinicInput {
  name: string;
  address: string;
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
      { address: { [Op.iLike]: pattern } },
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

function buildDuplicateWhere(input: CreateClinicInput): WhereOptions {
  return {
    name: input.name,
    phone: input.phone,
  };
}

export class ClinicService {
  async list(input: ListClinicsInput) {
    const { currentPage, pageSize, offset, limit } = getPaginationParams(input);

     const searchWhere = buildSearchWhere(input.search);

    const dateWhere = buildDateWhere(
      input.dateFrom,
      input.dateTo,
    );
      const clinics: WhereOptions[] = [];
     if (searchWhere) {
    clinics.push(searchWhere);
  }

  if (dateWhere) {
    clinics.push(dateWhere);
  }

  const where: WhereOptions =
    clinics.length > 0
      ? { [Op.and]: clinics }
      : {};
  const sortBy = input.sortBy ?? "name";
  const sortOrder = input.sortOrder ?? "asc";
    const { count, rows } = await Clinic.findAndCountAll({
      attributes: ["id", "name", "address", "phone", "createdAt"],
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

  async create(input: CreateClinicInput) {
    const existing = await Clinic.findOne({
      where: buildDuplicateWhere(input),
    });

    if (existing) {
      throw createError("Clinic already exists", 409);
    }

    try {
      return await Clinic.create(input);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw createError("Clinic already exists", 409);
      }
      throw error;
    }
  }
}

export const clinicService = new ClinicService();
