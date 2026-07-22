import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";
import { timestampColumns } from "../timestamps";

export interface ConditionSymptomAttributes {
  id: string;
  userConditionId: string;
  userSymptomId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConditionSymptomCreationAttributes
  extends Optional<ConditionSymptomAttributes, "id"> {}

export class ConditionSymptom
  extends Model<ConditionSymptomAttributes, ConditionSymptomCreationAttributes>
  implements ConditionSymptomAttributes
{
  declare id: string;
  declare userConditionId: string;
  declare userSymptomId: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof ConditionSymptom {
    ConditionSymptom.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userConditionId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "user_conditions", key: "id" },
          onDelete: "CASCADE",
        },
        userSymptomId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "user_symptoms", key: "id" },
          onDelete: "CASCADE",
        },
        ...timestampColumns,
      },
      {
        sequelize,
        tableName: "condition_symptoms",
        timestamps: true,
        underscored: true,
        indexes: [
          {
            unique: true,
            fields: ["user_condition_id", "user_symptom_id"],
          },
        ],
      },
    );
    return ConditionSymptom;
  }
}
