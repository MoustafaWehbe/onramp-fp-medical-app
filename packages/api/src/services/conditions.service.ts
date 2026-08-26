import { buildPaginatedResponse, getPaginationParams, PaginationInput } from "src/lib/pagination";
import { searchConditionsFromApi } from "../lib/catalog-condition-api";
import { Op,Sequelize, UniqueConstraintError,type WhereOptions} from "sequelize";
import { ConditionCatalog } from "src/models/catalogs/ConditionCatalog";
import { createError } from "src/middleware/error-handler";
import type { AppLanguage } from "../lib/app-language";
import { localizeResponse } from "../lib/localize-response";
import { buildLocalizedNameSearch } from "../lib/localized-search";

export interface ListConditionsInput extends PaginationInput {
  search?: string;
  language?: AppLanguage;
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
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

export interface CreateConditionInput {
  name: string;

}

export class ConditionService {

  async list(input: ListConditionsInput) {
      const language = input.language ?? "en";
      const { currentPage, pageSize, offset, limit } = getPaginationParams(input);
    const searchWhere = await buildLocalizedNameSearch(
        language,
        input.search,
      );

      const dateWhere = buildDateWhere(
        input.dateFrom,
        input.dateTo,
      );

      const conditions: WhereOptions[] = [];

      if (searchWhere) {
        conditions.push(searchWhere);
      }

      if (dateWhere) {
        conditions.push(dateWhere);
      }

      const where: WhereOptions =
        conditions.length > 0
          ? { [Op.and]: conditions }
          : {};

      const sortBy = input.sortBy ?? "name";
      const sortOrder = input.sortOrder ?? "asc";

      const { count, rows } = await ConditionCatalog.findAndCountAll({
        attributes: ["id", "name", "nameAr", "createdAt"],
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
