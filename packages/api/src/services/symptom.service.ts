import { Op, UniqueConstraintError } from "sequelize";
import { SymptomCatalog } from "../models";
import { searchSymptomsFromApi } from "../lib/symptoms";
import {
  buildPaginatedResponse,
  getPaginationParams,
  type PaginationInput,
} from "../lib/pagination";
import { createError } from "../middleware/error-handler";

export interface ListSymptomsInput extends PaginationInput {
  search?: string;
}

export interface CreateSymptomInput {
  name: string;
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
      { category: { [Op.iLike]: pattern } },
    ],
  };
}

export class SymptomCatalogService {
  async list(input: ListSymptomsInput) {
    const { currentPage, pageSize, offset, limit } = getPaginationParams(input);

    const { count, rows } = await SymptomCatalog.findAndCountAll({
      attributes: ["id", "name", "category", "createdAt"],
      where: buildSearchWhere(input.search),
      order: [["name", "ASC"]],
      limit,
      offset,
    });

    return buildPaginatedResponse(rows, count, currentPage, pageSize);
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
