import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";
import { timestampColumns } from "../timestamps";

export interface ConditionCatalogAttributes {
  id: string;
  name: string;
  nameAr?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConditionCatalogCreationAttributes
  extends Optional<ConditionCatalogAttributes, "id" | "nameAr"> {}

export class ConditionCatalog
  extends Model<ConditionCatalogAttributes, ConditionCatalogCreationAttributes>
  implements ConditionCatalogAttributes
{
  declare id: string;
  declare name: string;
  declare nameAr: string | null | undefined;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof ConditionCatalog {
    ConditionCatalog.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        nameAr: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        ...timestampColumns,
      },
      {
        sequelize,
        tableName: "condition_catalog",
        timestamps: true,
        underscored: true,
        indexes: [{ unique: true, fields: ["name"] }],
      },
    );
    return ConditionCatalog;
  }
}
