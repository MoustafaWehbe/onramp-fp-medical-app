import { buildPaginatedResponse, getPaginationParams, PaginationInput } from "src/lib/pagination";
import { searchConditionsFromApi } from "../lib/catalog-condition-api";
import { Sequelize, UniqueConstraintError} from "sequelize";
import { ConditionCatalog } from "src/models/catalogs/ConditionCatalog";
import { createError } from "src/middleware/error-handler";
import type { AppLanguage } from "../lib/app-language";
import { localizeResponse } from "../lib/localize-response";
import { buildLocalizedNameSearch } from "../lib/localized-search";

export interface ListConditionsInput extends PaginationInput {
  search?: string;
  language?: AppLanguage;
}

export interface CreateConditionInput {
  name: string;

}

export class ConditionService {

  async list(input: ListConditionsInput) {
      const language = input.language ?? "en";
      const { currentPage, pageSize, offset, limit } = getPaginationParams(input);
  
      const { count, rows } = await ConditionCatalog.findAndCountAll({
        attributes: ["id", "name", "nameAr", "createdAt"],
        where: await buildLocalizedNameSearch(language, input.search),
        order: [
          ["name", "ASC"],
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
    async searchConditions(term?: string) {
    if (!term) return [];
    
    return await searchConditionsFromApi(term);
  }
    
  async getById(id: string, language: AppLanguage = "en") {
    const condition = await ConditionCatalog.findByPk(id, {
      attributes: ["id", "name", "nameAr", "createdAt", "updatedAt"],
    });

    if (!condition) {
      throw createError("Condition not found", 404);
    }

    return localizeResponse(condition, language);
  }

  async create(input: CreateConditionInput) {
    const name = input.name.trim();
    if (!name) {
      throw createError("Name is required", 422);
    }
    const existing = await ConditionCatalog.findOne({
    where:
      Sequelize.where(
      Sequelize.fn("LOWER", Sequelize.col("name")),
      name.toLowerCase(),
    ),
    attributes: ["id"],
    });
    if (existing) {
      throw createError("Condition already exists", 409);
    }
    try {
      return await ConditionCatalog.create({
        name,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw createError("Condition already exists", 409);
      }
      throw error;
    }
  }
}

export const conditionService = new ConditionService();
