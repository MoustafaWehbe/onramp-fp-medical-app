import { Op, UniqueConstraintError } from "sequelize";
import { ConditionCatalog, UserCondition } from "../models";
import {
  buildPaginatedResponse,
  getPaginationParams,
  type PaginationInput,
} from "../lib/pagination";
import { createError } from "../middleware/error-handler";
import type { ConditionStatus } from "../../../shared/db/types/enums";

export interface ListUserConditionsInput extends PaginationInput {
  userId: string;
  search?: string;
}

export interface CreateUserConditionInput {
  userId: string;
  conditionId: string;
  description?: string | null;
  diagnosedDate?: string | null;
  status?: ConditionStatus;
  notes?: string | null;
}

export interface UpdateUserConditionInput {
  userId: string;
  id: string;
  description?: string | null;
  diagnosedDate?: string | null;
  status?: ConditionStatus;
  notes?: string | null;
}

function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

// builds a Sequelize where clause for searching conditions by name
function conditionInclude(search?: string) {
  const trimmed = search?.trim();
  const pattern = trimmed ? `%${escapeLike(trimmed)}%` : undefined;

  return {
    model: ConditionCatalog,
    as: "condition" as const,
    attributes: ["id", "name"],
    required: Boolean(pattern),
    ...(pattern
      ? {
          where: {
            name: {
              [Op.iLike]: pattern,
            },
          },
        }
      : {}),
  };
}

// checks if a condition exists in the catalog, throws an error if not found
async function assertConditionExists(conditionId: string) {
  const condition = await ConditionCatalog.findByPk(conditionId, {
    attributes: ["id"],
  });

  if (!condition) {
    throw createError("Condition not found", 404);
  }
}

// finds a user condition by userId and id, throws an error if not found
async function findOwnedUserCondition(
  userId: string,
  id: string,
) {
  const userCondition = await UserCondition.findOne({
    where: {
      id,
      userId,
    },
    include: [
      conditionInclude(),
    ],
  });
  if (!userCondition) {
    throw createError("User condition not found", 404);
  }

  return userCondition;
}

export class UserConditionService {

// list user conditions with pagination and optional search
  async list(input: ListUserConditionsInput) {
    const {
      currentPage,
      pageSize,
      offset,
      limit,
    } = getPaginationParams(input);

    const {
      count,
      rows,
    } = await UserCondition.findAndCountAll({
      where:{
        userId: input.userId,
      },
      include:[
        conditionInclude(input.search),
      ],
      order:[
        ["createdAt","DESC"],
        ["id","ASC"],
      ],
      limit,
      offset,
      distinct:true,
    });

    return buildPaginatedResponse(
      rows,
      count,
      currentPage,
      pageSize,
    );
  }
//   get a user condition by id and userId
  async getById(
    userId:string,
    id:string,
  ){
    return findOwnedUserCondition(
      userId,
      id,
    );
  }
// creates a new user condition
  async create(
    input:CreateUserConditionInput,
  ){
    await assertConditionExists(
      input.conditionId,
    );
    const existing =
      await UserCondition.findOne({
        where:{
          userId:input.userId,
          conditionId:input.conditionId,
        },
        attributes:["id"],
      });
    if(existing){
      throw createError(
        "Condition already linked to profile",
        409,
      );
    }
    try{
      const created =
        await UserCondition.create({
          userId:input.userId,
          conditionId:input.conditionId,
          description:
            input.description ?? undefined,
          diagnosedDate:
            input.diagnosedDate ?? undefined,
          status:
            input.status,
          notes:
            input.notes ?? undefined,
        });

      return findOwnedUserCondition(
        input.userId,
        created.id,
      );
    }catch(error){
      if(error instanceof UniqueConstraintError){
        throw createError(
          "Condition already linked to profile",
          409,
        );
      }
      throw error;
    }
  }

//updates an existing user condition 
  async update(
    input:UpdateUserConditionInput,
  ){
    const userCondition =
      await UserCondition.findOne({
        where:{
          id:input.id,
          userId:input.userId,
        },
      });
    if(!userCondition){
      throw createError(
        "User condition not found",
        404,
      );
    }
    if(input.description !== undefined){
      userCondition.setDataValue(
        "description",
        input.description as string | undefined,
      );
    }
    if(input.diagnosedDate !== undefined){
      userCondition.setDataValue(
        "diagnosedDate",
        input.diagnosedDate as string | undefined,
      );
    }
    if(input.status !== undefined){

      userCondition.setDataValue(
        "status",
        input.status,
      );
    }
    if(input.notes !== undefined){

      userCondition.setDataValue(
        "notes",
        input.notes as string | undefined,
      );

    }
    await userCondition.save();
    return findOwnedUserCondition(
      input.userId,
      userCondition.id,
    );
  }

// removes a user condition by setting its active status to false
  async remove(
    userId:string,
    id:string,
  ){
    const userCondition =
      await UserCondition.findOne({
        where:{
          id,
          userId,
        },
      });

    if(!userCondition){
      throw createError(
        "User condition not found",
        404,
      );

    }
    userCondition.active=false;
    await userCondition.save();
    return {
      id:userCondition.id,
      active:false,
    };
  }
}

export const userConditionService =
  new UserConditionService();