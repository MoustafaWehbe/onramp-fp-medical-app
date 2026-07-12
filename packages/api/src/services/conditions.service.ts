import { buildPaginatedResponse, getPaginationParams, PaginationInput } from "src/lib/pagination";
import { searchConditionsFromApi } from "../lib/catalog-condition-api";
import { Op, UniqueConstraintError, WhereOptions } from "sequelize";
import { ConditionCatalog } from "src/models/catalogs/ConditionCatalog";
import { createError } from "src/middleware/error-handler";

export interface ListConditionsInput extends PaginationInput {
  search?: string;
}

export interface CreateConditionInput {
  name: string;

}

function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

function buildSearchWhere(search?: string) {
  const trimmed = search?.trim();
  if (!trimmed) return undefined;

  const pattern = `%${escapeLike(trimmed)}%`;

 return {
    name: {
      [Op.iLike]: pattern,
    },
  };
}
export class ConditionService {

  async list(input: ListConditionsInput) {
      const { currentPage, pageSize, offset, limit } = getPaginationParams(input);
  
      const { count, rows } = await ConditionCatalog.findAndCountAll({
        attributes: ["id", "name", "createdAt"],
        where: buildSearchWhere(input.search),
        order: [
          ["name", "ASC"],
        ],
        limit,
        offset,
      });
  
      return buildPaginatedResponse(rows, count, currentPage, pageSize);
    }

  async create(input: CreateConditionInput) {
    try {
      return await ConditionCatalog.create(input);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw createError("Condition already exists", 409);
      }

    throw error;
  }
}
  
  async searchConditions(term?: string) {
    if (!term) return [];
    
    return await searchConditionsFromApi(term);
  }
}

export const conditionService = new ConditionService();