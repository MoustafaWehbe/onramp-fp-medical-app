import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface MedicationAttributes {
  id: string;
  name: string;
  strength?: string;
  category?: string;
  createdAt?: Date;
}

export interface MedicationCreationAttributes
  extends Optional<MedicationAttributes, "id" | "strength" | "category"> {}

export class Medication
  extends Model<MedicationAttributes, MedicationCreationAttributes>
  implements MedicationAttributes
{
  declare id: string;
  declare name: string;
  declare strength: string | undefined;
  declare category: string | undefined;
  declare readonly createdAt: Date;

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
        strength: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        category: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "medications",
        timestamps: true,
        updatedAt: false,
        underscored: true,
      },
    );
    return Medication;
  }
}
