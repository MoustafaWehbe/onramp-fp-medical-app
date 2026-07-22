import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";
import type { ConditionStatus } from "../../types";
import { timestampColumns } from "../timestamps";
import { activeColumn, softDeleteModelOptions } from "../soft-delete";

export interface UserConditionAttributes {
  id: string;
  userId: string;
  conditionId: string;
  description?: string;
  diagnosedDate?: string;
  status: ConditionStatus;
  notes?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserConditionCreationAttributes extends Optional<
  UserConditionAttributes,
  "id" | "description" | "diagnosedDate" | "status" | "notes" | "active"
> {}

export class UserCondition
  extends Model<UserConditionAttributes, UserConditionCreationAttributes>
  implements UserConditionAttributes
{
  declare id: string;
  declare userId: string;
  declare conditionId: string;
  declare description: string | undefined;
  declare diagnosedDate: string | undefined;
  declare status: ConditionStatus;
  declare notes: string | undefined;
  declare active: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof UserCondition {
    UserCondition.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onDelete: "CASCADE",
        },
        conditionId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "condition_catalog", key: "id" },
          onDelete: "NO ACTION",
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        diagnosedDate: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
        status: {
          type: DataTypes.STRING(50),
          defaultValue: "active",
          allowNull: false,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        active: activeColumn,
        ...timestampColumns,
      },
      {
        sequelize,
        tableName: "user_conditions",
        timestamps: true,
        underscored: true,
        ...softDeleteModelOptions,
        indexes: [
          {
            unique: true,
            fields: ["user_id", "condition_id"],
            where: { active: true },
            name: "user_conditions_user_condition_active_unique",
          },
        ],
      },
    );
    return UserCondition;
  }
}
