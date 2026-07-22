import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";
import { timestampColumns } from "../timestamps";
import { activeColumn, softDeleteModelOptions } from "../soft-delete";

export interface UserSymptomAttributes {
  id: string;
  userId: string;
  catalogId: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserSymptomCreationAttributes extends Optional<
  UserSymptomAttributes,
  "id" | "active"
> {}

export class UserSymptom
  extends Model<UserSymptomAttributes, UserSymptomCreationAttributes>
  implements UserSymptomAttributes
{
  declare id: string;
  declare userId: string;
  declare catalogId: string;
  declare active: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof UserSymptom {
    UserSymptom.init(
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
        catalogId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "symptom_catalog", key: "id" },
          onDelete: "NO ACTION",
        },
        active: activeColumn,
        ...timestampColumns,
      },
      {
        sequelize,
        tableName: "user_symptoms",
        timestamps: true,
        underscored: true,
        ...softDeleteModelOptions,
        indexes: [
          {
            unique: true,
            fields: ["user_id", "catalog_id"],
            where: { active: true },
            name: "user_symptoms_user_catalog_active_unique",
          },
        ],
      },
    );
    return UserSymptom;
  }
}
