import { UniqueConstraintError } from "sequelize";
import {
  ConditionCatalog,
  ConditionSymptom,
  SymptomCatalog,
  UserCondition,
  UserSymptom,
} from "../models";
import {
  buildPaginatedResponse,
  getPaginationParams,
  type PaginationInput,
} from "../lib/pagination";
import { createError } from "../middleware/error-handler";

export interface ListConditionSymptomsInput extends PaginationInput {
  userId: string;
  userConditionId: string;
}

export interface ListAllConditionSymptomsInput extends PaginationInput {
  userId: string;
}

export interface LinkConditionSymptomInput {
  userId: string;
  userConditionId: string;
  userSymptomId: string;
}

async function assertOwnedActiveCondition(
  userId: string,
  userConditionId: string,
) {
  const userCondition = await UserCondition.findOne({
    where: { id: userConditionId, userId },
    attributes: ["id"],
  });

  if (!userCondition) {
    throw createError("User condition not found", 404);
  }

  return userCondition;
}

async function assertOwnedActiveSymptom(
  userId: string,
  userSymptomId: string,
) {
  const userSymptom = await UserSymptom.findOne({
    where: { id: userSymptomId, userId },
    attributes: ["id"],
  });

  if (!userSymptom) {
    throw createError("User symptom not found", 404);
  }

  return userSymptom;
}

function linkedSymptomInclude() {
  return {
    model: UserSymptom,
    as: "userSymptom" as const,
    attributes: ["id", "userId", "catalogId", "active", "createdAt", "updatedAt"],
    include: [
      {
        model: SymptomCatalog,
        as: "catalog" as const,
        attributes: ["id", "name", "category"],
      },
    ],
  };
}

function linkedConditionInclude(userId?: string) {
  return {
    model: UserCondition,
    as: "userCondition" as const,
    attributes: ["id", "userId", "conditionId", "status", "active"],
    required: Boolean(userId),
    ...(userId ? { where: { userId } } : {}),
    include: [
      {
        model: ConditionCatalog,
        as: "condition" as const,
        attributes: ["id", "name"],
      },
    ],
  };
}

export class ConditionSymptomService {
  async listAll(input: ListAllConditionSymptomsInput) {
    const { currentPage, pageSize, offset, limit } = getPaginationParams(input);

    const { count, rows } = await ConditionSymptom.findAndCountAll({
      include: [
        linkedConditionInclude(input.userId),
        linkedSymptomInclude(),
      ],
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

  async list(input: ListConditionSymptomsInput) {
    await assertOwnedActiveCondition(input.userId, input.userConditionId);

    const { currentPage, pageSize, offset, limit } = getPaginationParams(input);

    const { count, rows } = await ConditionSymptom.findAndCountAll({
      where: { userConditionId: input.userConditionId },
      include: [linkedConditionInclude(), linkedSymptomInclude()],
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

  async link(input: LinkConditionSymptomInput) {
    await assertOwnedActiveCondition(input.userId, input.userConditionId);
    await assertOwnedActiveSymptom(input.userId, input.userSymptomId);

    const existing = await ConditionSymptom.findOne({
      where: {
        userConditionId: input.userConditionId,
        userSymptomId: input.userSymptomId,
      },
      attributes: ["id"],
    });

    if (existing) {
      throw createError("Symptom already linked to condition", 409);
    }

    try {
      const created = await ConditionSymptom.create({
        userConditionId: input.userConditionId,
        userSymptomId: input.userSymptomId,
      });

      return ConditionSymptom.findByPk(created.id, {
        include: [linkedConditionInclude(), linkedSymptomInclude()],
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw createError("Symptom already linked to condition", 409);
      }
      throw error;
    }
  }

  async unlink(
    userId: string,
    userConditionId: string,
    userSymptomId: string,
  ) {
    await assertOwnedActiveCondition(userId, userConditionId);

    const link = await ConditionSymptom.findOne({
      where: {
        userConditionId,
        userSymptomId,
      },
    });

    if (!link) {
      throw createError("Condition symptom link not found", 404);
    }

    await link.destroy();

    return { message: "Unlinked" };
  }
}

export const conditionSymptomService = new ConditionSymptomService();
