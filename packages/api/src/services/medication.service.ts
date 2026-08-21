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
import type { AppLanguage } from "../lib/app-language";
import { localizeDeep } from "../lib/app-language";
import { buildLocalizedNameSearch } from "../lib/localized-search";

export interface ListMedicationsInput extends PaginationInput {
  search?: string;
  language?: AppLanguage;
}

export interface CreateMedicationInput {
  name: string;
  strength?: string;
  category?: string;
}

export class MedicationService {
  async list(input: ListMedicationsInput) {
    const language = input.language ?? "en";
    const { currentPage, pageSize, offset, limit } = getPaginationParams(input);

    const { count, rows } = await Medication.findAndCountAll({
      attributes: [
        "id",
        "name",
        "nameAr",
        "strength",
        "category",
        "categoryAr",
        "createdAt",
      ],
      where: buildLocalizedNameSearch(language, input.search, [
        "strength",
        "category",
      ]),
      order: [
        ["name", "ASC"],
        ["strength", "ASC"],
      ],
      limit,
      offset,
    });

    return buildPaginatedResponse(
      localizeDeep(rows, language),
      count,
      currentPage,
      pageSize,
    );
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

  async getById(id: string, language: AppLanguage = "en") {
    const medication = await Medication.findByPk(id, {
      attributes: [
        "id",
        "name",
        "nameAr",
        "strength",
        "category",
        "categoryAr",
        "createdAt",
        "updatedAt",
      ],
    });

    if (!medication) {
      throw createError("Medication not found", 404);
    }

    return localizeDeep(medication, language);
  }
}

export const medicationService = new MedicationService();
