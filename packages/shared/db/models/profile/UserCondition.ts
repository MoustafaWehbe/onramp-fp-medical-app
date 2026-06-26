import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";
import type { ConditionStatus } from "../../types";

export interface UserConditionAttributes {
  id: string;
  userId: string;
  conditionId?: string;
  customName?: string;
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
  "id" | "conditionId" | "customName" | "description" | "diagnosedDate" | "status" | "notes" | "active"
> {}

export class UserCondition
  extends Model<UserConditionAttributes, UserConditionCreationAttributes>
  implements UserConditionAttributes
{
  declare id: string;
  declare userId: string;
  declare conditionId: string | undefined;
  declare customName: string | undefined;
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
          allowNull: true,
          references: { model: "condition_catalog", key: "id" },
          onDelete: "SET NULL",
        },
        customName: {
          type: DataTypes.STRING(255),
          allowNull: true,
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
        active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "user_conditions",
        timestamps: true,
        underscored: true,
        validate: {
          hasCatalogOrCustomName(this: UserCondition) {
            const hasCatalog = this.conditionId != null;
            const hasCustomName = this.customName != null;

            if (hasCatalog === hasCustomName) {
              throw new Error(
                "UserCondition must have either conditionId or customName.",
              );
            }
          },
        },
      },
    );
    return UserCondition;
  }
}
