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

function buildDuplicateWhere(input: CreateClinicInput): WhereOptions {
  return {
    name: input.name,
    phone: input.phone,
  };
}

export class ClinicService {
  async list(input: ListClinicsInput) {
    const { currentPage, pageSize, offset, limit } = getPaginationParams(input);

    const { count, rows } = await Clinic.findAndCountAll({
      attributes: ["id", "name", "address", "phone", "createdAt"],
      where: buildSearchWhere(input.search),
      order: [
        ["name", "ASC"],
        ["address", "ASC"],
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
