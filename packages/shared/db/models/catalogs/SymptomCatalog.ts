import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface SymptomCatalogAttributes {
  id: string;
  name: string;
  category?: string;
  createdAt?: Date;
}

export interface SymptomCatalogCreationAttributes
  extends Optional<SymptomCatalogAttributes, "id" | "category"> {}

export class SymptomCatalog
  extends Model<SymptomCatalogAttributes, SymptomCatalogCreationAttributes>
  implements SymptomCatalogAttributes
{
  declare id: string;
  declare name: string;
  declare category: string | undefined;
  declare readonly createdAt: Date;

  static initModel(sequelize: Sequelize): typeof SymptomCatalog {
    SymptomCatalog.init(
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
        category: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "symptom_catalog",
        timestamps: true,
        updatedAt: false,
        underscored: true,
      },
    );
    return SymptomCatalog;
  }
}
