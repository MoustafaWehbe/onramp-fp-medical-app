import { Op, UniqueConstraintError, type WhereOptions } from "sequelize";
import { SymptomCatalog } from "../models";
import { searchSymptomsFromApi } from "../lib/symptoms";
import {
  buildPaginatedResponse,
  getPaginationParams,
  type PaginationInput,
} from "../lib/pagination";
import { createError } from "../middleware/error-handler";
import type { AppLanguage } from "../lib/app-language";
import { localizeResponse } from "../lib/localize-response";
import { buildLocalizedNameSearch } from "../lib/localized-search";

export interface ListSymptomsInput extends PaginationInput {
  search?: string;
  language?: AppLanguage;
}

export interface CreateSymptomInput {
  name: string;
  category?: string;
  isCustom?: boolean;
  language?: AppLanguage;
}

function visibilityWhere(language: AppLanguage): WhereOptions {
  return {
    retiredAt: null,
    [Op.or]: [
      { isCustom: false },
      { isCustom: true, language },
    ],
  };
}

export class SymptomCatalogService {
  async list(input: ListSymptomsInput) {
    const language = input.language ?? "en";
    const { currentPage, pageSize, offset, limit } = getPaginationParams(input);
    const searchWhere = await buildLocalizedNameSearch(
      language,
      input.search,
      ["category"],
    );

    const where: WhereOptions = searchWhere
      ? { [Op.and]: [visibilityWhere(language), searchWhere] }
      : visibilityWhere(language);

    const { count, rows } = await SymptomCatalog.findAndCountAll({
      attributes: [
        "id",
        "name",
        "nameAr",
        "category",
        "categoryAr",
        "isCustom",
        "language",
        "createdAt",
      ],
      where,
      order: [["name", "ASC"]],
      limit,
      offset,
    });

    return buildPaginatedResponse(
      await localizeResponse(rows, language),
      count,
      currentPage,
      pageSize,
    );
  }

  async create(input: CreateSymptomInput) {
    const isCustom = input.isCustom ?? false;
    const language = isCustom ? (input.language ?? "en") : "en";

    const existing = await SymptomCatalog.findOne({
      where: isCustom
        ? { name: input.name, isCustom: true, language }
        : { name: input.name },
    });

    if (existing) {
      throw createError("Symptom already exists", 409);
    }

    try {
      return await SymptomCatalog.create({
        name: input.name,
        category: input.category,
        isCustom,
        language,
      });
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
