import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";
import { timestampColumns } from "../timestamps";

export type SymptomCatalogLanguage = "en" | "ar";

export interface SymptomCatalogAttributes {
  id: string;
  name: string;
  nameAr?: string | null;
  category?: string | null;
  categoryAr?: string | null;
  isCustom: boolean;
  language: SymptomCatalogLanguage;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SymptomCatalogCreationAttributes
  extends Optional<
    SymptomCatalogAttributes,
    "id" | "category" | "nameAr" | "categoryAr" | "isCustom" | "language"
  > {}

export class SymptomCatalog
  extends Model<SymptomCatalogAttributes, SymptomCatalogCreationAttributes>
  implements SymptomCatalogAttributes
{
  declare id: string;
  declare name: string;
  declare nameAr: string | null | undefined;
  declare category: string | null | undefined;
  declare categoryAr: string | null | undefined;
  declare isCustom: boolean;
  declare language: SymptomCatalogLanguage;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

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
        },
        nameAr: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        category: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        categoryAr: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        isCustom: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        language: {
          type: DataTypes.STRING(5),
          allowNull: false,
          defaultValue: "en",
        },
        ...timestampColumns,
      },
      {
        sequelize,
        tableName: "symptom_catalog",
        timestamps: true,
        underscored: true,
        indexes: [
          { unique: true, fields: ["name", "language"], name: "symptom_catalog_name_language_unique" },
          { fields: ["language"] },
        ],
      },
    );
    return SymptomCatalog;
  }
}
