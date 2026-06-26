import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface ConditionCatalogAttributes {
  id: string;
  name: string;
  createdAt?: Date;
}

export interface ConditionCatalogCreationAttributes
  extends Optional<ConditionCatalogAttributes, "id"> {}

export class ConditionCatalog
  extends Model<ConditionCatalogAttributes, ConditionCatalogCreationAttributes>
  implements ConditionCatalogAttributes
{
  declare id: string;
  declare name: string;
  declare readonly createdAt: Date;

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
          unique: true,
        },
      },
      {
        sequelize,
        tableName: "condition_catalog",
        timestamps: true,
        updatedAt: false,
        underscored: true,
      },
    );
    return ConditionCatalog;
  }
}
