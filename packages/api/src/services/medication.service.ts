import { Op, UniqueConstraintError, type WhereOptions } from "sequelize";
import { Medication } from "../models";
import {
  buildPaginatedResponse,
  getPaginationParams,
  type PaginationInput,
} from "../lib/pagination";
import { lookupMedicationCategory } from "../lib/medication-category";
import { searchMedicationNames } from "../lib/medication-search";
import { createError } from "../middleware/error-handler";

export interface ListMedicationsInput extends PaginationInput {
  search?: string;
}

export interface CreateMedicationInput {
  name: string;
  strength?: string;
  category?: string;
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
      { strength: { [Op.iLike]: pattern } },
      { category: { [Op.iLike]: pattern } },
    ],
  };
}

export class MedicationService {
  async list(input: ListMedicationsInput) {
    const { currentPage, pageSize, offset, limit } = getPaginationParams(input);

    const { count, rows } = await Medication.findAndCountAll({
      attributes: ["id", "name", "strength", "category", "createdAt"],
      where: buildSearchWhere(input.search),
      order: [
        ["name", "ASC"],
        ["strength", "ASC"],
      ],
      limit,
      offset,
    });

    return buildPaginatedResponse(rows, count, currentPage, pageSize);
  }

  async create(input: CreateMedicationInput) {
    const where =
      input.strength !== undefined
        ? { name: input.name, strength: input.strength }
        : { name: input.name, strength: { [Op.is]: null } };

    const existing = await Medication.findOne({
      where: where as WhereOptions,
    });

    if (existing) {
      throw createError("Medication already exists", 409);
    }

    try {
      return await Medication.create(input);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw createError("Medication already exists", 409);
      }
      throw error;
    }
  }

  async searchNames(search: string): Promise<string[]> {
    try {
      return await searchMedicationNames(search);
    } catch {
      throw createError("Failed to search medications", 502);
    }
  }

  async lookupCategoryOnline(name: string): Promise<string | null> {
    try {
      return await lookupMedicationCategory(name);
    } catch {
      throw createError("Failed to lookup medication category", 502);
    }
  }
}

export const medicationService = new MedicationService();
