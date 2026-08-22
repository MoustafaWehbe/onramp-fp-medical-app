import { UniqueConstraintError } from "sequelize";
import { ConditionCatalog, UserCondition } from "../models";
import {
  buildPaginatedResponse,
  getPaginationParams,
  type PaginationInput,
} from "../lib/pagination";
import { createError } from "../middleware/error-handler";
import type { ConditionStatus } from "@starter-kit/shared/db/types/enums";
import type { AppLanguage } from "../lib/app-language";
import { localizeResponse } from "../lib/localize-response";
import { buildLocalizedNameSearch } from "../lib/localized-search";

export interface ListUserConditionsInput extends PaginationInput {
  userId: string;
  search?: string;
  language?: AppLanguage;
}

export interface CreateUserConditionInput {
  userId: string;
  conditionId: string;
  description?: string | null;
  diagnosedDate?: string | null;
  status?: ConditionStatus;
  notes?: string | null;
  language?: AppLanguage;
}

export interface UpdateUserConditionInput {
  userId: string;
  id: string;
  description?: string | null;
  diagnosedDate?: string | null;
  status?: ConditionStatus;
  notes?: string | null;
  language?: AppLanguage;
}

async function conditionInclude(search?: string, language: AppLanguage = "en") {
  const where = search?.trim()
    ? await buildLocalizedNameSearch(language, search)
    : undefined;

  return {
    model: ConditionCatalog,
    as: "condition" as const,
    attributes: ["id", "name", "nameAr"],
    required: Boolean(search?.trim()),
    ...(where ? { where } : {}),
  };
}

async function assertConditionExists(conditionId: string) {
  const condition = await ConditionCatalog.findByPk(conditionId, {
    attributes: ["id"],
  });

  if (!condition) {
    throw createError("Condition not found", 404);
  }
}

async function findOwnedUserCondition(
  userId: string,
  id: string,
  language: AppLanguage = "en",
) {
  const userCondition = await UserCondition.findOne({
    where: {
      id,
      userId,
    },
    include: [await conditionInclude(undefined, language)],
  });
  if (!userCondition) {
    throw createError("User condition not found", 404);
  }

  return localizeResponse(userCondition, language);
}

export class UserConditionService {
  async list(input: ListUserConditionsInput) {
    const language = input.language ?? "en";
    const { currentPage, pageSize, offset, limit } = getPaginationParams(input);

    const { count, rows } = await UserCondition.findAndCountAll({
      where: {
        userId: input.userId,
      },
      include: [await conditionInclude(input.search, language)],
      order: [
        ["createdAt", "DESC"],
        ["id", "ASC"],
      ],
      limit,
      offset,
      distinct: true,
    });

    return buildPaginatedResponse(
      await localizeResponse(rows, language),
      count,
      currentPage,
      pageSize,
    );
  }

  async getById(userId: string, id: string, language: AppLanguage = "en") {
    return findOwnedUserCondition(userId, id, language);
  }

  async create(input: CreateUserConditionInput) {
    const language = input.language ?? "en";
    await assertConditionExists(input.conditionId);
    const existing = await UserCondition.findOne({
      where: {
        userId: input.userId,
        conditionId: input.conditionId,
      },
      attributes: ["id"],
    });
    if (existing) {
      throw createError("Condition already linked to profile", 409);
    }
    try {
      const created = await UserCondition.create({
        userId: input.userId,
        conditionId: input.conditionId,
        description: input.description ?? undefined,
        diagnosedDate: input.diagnosedDate ?? undefined,
        status: input.status,
        notes: input.notes ?? undefined,
      });

      return findOwnedUserCondition(input.userId, created.id, language);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw createError("Condition already linked to profile", 409);
      }
      throw error;
    }
  }

  async update(input: UpdateUserConditionInput) {
    const language = input.language ?? "en";
    const userCondition = await UserCondition.findOne({
      where: {
        id: input.id,
        userId: input.userId,
      },
    });
    if (!userCondition) {
      throw createError("User condition not found", 404);
    }
    if (input.description !== undefined) {
      userCondition.setDataValue(
        "description",
        input.description as string | undefined,
      );
    }
    if (input.diagnosedDate !== undefined) {
      userCondition.setDataValue(
        "diagnosedDate",
        input.diagnosedDate as string | undefined,
      );
    }
    if (input.status !== undefined) {
      userCondition.setDataValue("status", input.status);
    }
    if (input.notes !== undefined) {
      userCondition.setDataValue("notes", input.notes as string | undefined);
    }
    await userCondition.save();
    return findOwnedUserCondition(input.userId, userCondition.id, language);
  }

  async remove(userId: string, id: string) {
    const userCondition = await UserCondition.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!userCondition) {
      throw createError("User condition not found", 404);
    }
    userCondition.active = false;
    await userCondition.save();
    return {
      id: userCondition.id,
      active: false,
    };
  }
}

export const userConditionService = new UserConditionService();
