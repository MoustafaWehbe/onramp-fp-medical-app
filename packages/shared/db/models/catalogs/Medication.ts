import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";
import { timestampColumns } from "../timestamps";

export interface MedicationAttributes {
  id: string;
  name: string;
  nameAr?: string | null;
  strength?: string;
  category?: string;
  categoryAr?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MedicationCreationAttributes
  extends Optional<
    MedicationAttributes,
    "id" | "strength" | "category" | "nameAr" | "categoryAr"
  > {}

export class Medication
  extends Model<MedicationAttributes, MedicationCreationAttributes>
  implements MedicationAttributes
{
  declare id: string;
  declare name: string;
  declare nameAr: string | null | undefined;
  declare strength: string | undefined;
  declare category: string | undefined;
  declare categoryAr: string | null | undefined;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof Medication {
    Medication.init(
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
        strength: {
          type: DataTypes.STRING(100),
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
        ...timestampColumns,
      },
      {
        sequelize,
        tableName: "medications",
        timestamps: true,
        underscored: true,
        indexes: [{ unique: true, fields: ["name", "strength"] }],
      },
    );
    return Medication;
  }
}
