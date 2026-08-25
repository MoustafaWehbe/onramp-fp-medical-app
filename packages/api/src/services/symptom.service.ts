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
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateSymptomInput {
  name: string;
  category?: string;
  isCustom?: boolean;
  language?: AppLanguage;
}

function visibilityWhere(language: AppLanguage): WhereOptions {
  return {
    [Op.or]: [
      { isCustom: false },
      { isCustom: true, language },
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

export class SymptomCatalogService {
  async list(input: ListSymptomsInput) {
    const language = input.language ?? "en";
    const { currentPage, pageSize, offset, limit } = getPaginationParams(input);
    
    const searchWhere = await buildLocalizedNameSearch(
      language,
      input.search,
      ["category"],
    );
    const dateWhere = buildDateWhere(input.dateFrom, input.dateTo);

    const symptoms: WhereOptions[] = [visibilityWhere(language)];
     if (searchWhere) {
      symptoms.push(searchWhere);
    }

    if (dateWhere) {
      symptoms.push(dateWhere);
    }

    const where: WhereOptions = {
      [Op.and]: symptoms,
    };

    const sortBy = input.sortBy ?? "name";
    const sortOrder = input.sortOrder ?? "asc";

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
       order: [
      [sortBy, sortOrder === "asc" ? "ASC" : "DESC"],
      ["id", "ASC"],
    ],
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
