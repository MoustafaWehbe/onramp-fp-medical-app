import { Op, UniqueConstraintError } from "sequelize";
import { SymptomCatalog, UserSymptom } from "../models";
import {
  buildPaginatedResponse,
  getPaginationParams,
  type PaginationInput,
} from "../lib/pagination";
import { createError } from "../middleware/error-handler";

export interface ListUserSymptomsInput extends PaginationInput {
  userId: string;
  search?: string;
}

export interface CreateUserSymptomInput {
  userId: string;
  catalogId: string;
}

function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

function catalogInclude(search?: string) {
  const trimmed = search?.trim();
  const pattern = trimmed ? `%${escapeLike(trimmed)}%` : undefined;

  return {
    model: SymptomCatalog,
    as: "catalog" as const,
    attributes: ["id", "name", "category"],
    required: Boolean(pattern),
    ...(pattern
      ? {
          where: {
            [Op.or]: [
              { name: { [Op.iLike]: pattern } },
              { category: { [Op.iLike]: pattern } },
            ],
          },
        }
      : {}),
  };
}

async function assertSymptomCatalogExists(catalogId: string) {
  const catalog = await SymptomCatalog.findByPk(catalogId, {
    attributes: ["id"],
  });
  if (!catalog) {
    throw createError("Symptom catalog entry not found", 404);
  }
}

async function findOwnedUserSymptom(userId: string, id: string) {
  const userSymptom = await UserSymptom.findOne({
    where: { id, userId },
    include: [catalogInclude()],
  });

  if (!userSymptom) {
    throw createError("User symptom not found", 404);
  }

  return userSymptom;
}

export class UserSymptomService {
  async list(input: ListUserSymptomsInput) {
    const { currentPage, pageSize, offset, limit } = getPaginationParams(input);

    const { count, rows } = await UserSymptom.findAndCountAll({
      where: { userId: input.userId },
      include: [catalogInclude(input.search)],
      order: [
        ["createdAt", "DESC"],
        ["id", "ASC"],
      ],
      limit,
      offset,
      distinct: true,
    });

    return buildPaginatedResponse(rows, count, currentPage, pageSize);
  }

  async getById(userId: string, id: string) {
    return findOwnedUserSymptom(userId, id);
  }

  async create(input: CreateUserSymptomInput) {
    await assertSymptomCatalogExists(input.catalogId);

    const existing = await UserSymptom.findOne({
      where: {
        userId: input.userId,
        catalogId: input.catalogId,
      },
      attributes: ["id"],
    });

    if (existing) {
      throw createError("Symptom already linked to profile", 409);
    }

    try {
      const created = await UserSymptom.create({
        userId: input.userId,
        catalogId: input.catalogId,
      });

      return findOwnedUserSymptom(input.userId, created.id);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw createError("Symptom already linked to profile", 409);
      }
      throw error;
    }
  }

  async remove(userId: string, id: string) {
    const userSymptom = await UserSymptom.findOne({
      where: { id, userId },
    });

    if (!userSymptom) {
      throw createError("User symptom not found", 404);
    }

    userSymptom.active = false;
    await userSymptom.save();

    return { id: userSymptom.id, active: false };
  }
}

export const userSymptomService = new UserSymptomService();
