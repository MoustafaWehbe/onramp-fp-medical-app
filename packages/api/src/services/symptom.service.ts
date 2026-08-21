import { UniqueConstraintError } from "sequelize";
import { SymptomCatalog } from "../models";
import { searchSymptomsFromApi } from "../lib/symptoms";
import {
  buildPaginatedResponse,
  getPaginationParams,
  type PaginationInput,
} from "../lib/pagination";
import { createError } from "../middleware/error-handler";
import type { AppLanguage } from "../lib/app-language";
import { localizeDeep } from "../lib/app-language";
import { buildLocalizedNameSearch } from "../lib/localized-search";

export interface ListSymptomsInput extends PaginationInput {
  search?: string;
  language?: AppLanguage;
}

export interface CreateSymptomInput {
  name: string;
  category?: string;
}

export class SymptomCatalogService {
  async list(input: ListSymptomsInput) {
    const language = input.language ?? "en";
    const { currentPage, pageSize, offset, limit } = getPaginationParams(input);

    const { count, rows } = await SymptomCatalog.findAndCountAll({
      attributes: ["id", "name", "nameAr", "category", "categoryAr", "createdAt"],
      where: buildLocalizedNameSearch(language, input.search, ["category"]),
      order: [["name", "ASC"]],
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

  async create(input: CreateSymptomInput) {
    const existing = await SymptomCatalog.findOne({
      where: { name: input.name },
    });

    if (existing) {
      throw createError("Symptom already exists", 409);
    }

    try {
      return await SymptomCatalog.create(input);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw createError("Symptom already exists", 409);
      }
      throw error;
    }
  }

  async searchSymptomsOnline(search: string): Promise<string[]> {
    try {
      return await searchSymptomsFromApi(search);
    } catch {
      throw createError("Failed to search symptoms", 502);
    }
  }
}

export const symptomCatalogService = new SymptomCatalogService();
