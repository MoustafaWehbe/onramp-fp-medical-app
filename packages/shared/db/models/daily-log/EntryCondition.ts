import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";
import type { ConditionStatus } from "../../types";

export interface EntryConditionAttributes {
  id: string;
  entryId: string;
  userConditionId: string;
  status: ConditionStatus;
  notes?: string;
  createdAt?: Date;
}

export interface EntryConditionCreationAttributes extends Optional<
  EntryConditionAttributes,
  "id" | "status" | "notes"
> {}

export class EntryCondition
  extends Model<EntryConditionAttributes, EntryConditionCreationAttributes>
  implements EntryConditionAttributes
{
  declare id: string;
  declare entryId: string;
  declare userConditionId: string;
  declare status: ConditionStatus;
  declare notes: string | undefined;
  declare readonly createdAt: Date;

  static initModel(sequelize: Sequelize): typeof EntryCondition {
    EntryCondition.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        entryId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "daily_entries", key: "id" },
          onDelete: "CASCADE",
        },
        userConditionId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "user_conditions", key: "id" },
          onDelete: "RESTRICT",
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
      },
      {
        sequelize,
        tableName: "entry_conditions",
        timestamps: true,
        updatedAt: false,
        underscored: true,
        indexes: [{ unique: true, fields: ["entry_id", "user_condition_id"] }],
      },
    );
    return EntryCondition;
  }
}
