import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";
import type { DosageMeasurement } from "../../types";
import { timestampColumns } from "../timestamps";
import { activeColumn, softDeleteModelOptions } from "../soft-delete";

export interface UserMedicationAttributes {
  id: string;
  userId: string;
  medicationId: string;
  dosage?: number;
  dosageMeasurement?: DosageMeasurement;
  frequency?: string;
  notes?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserMedicationCreationAttributes extends Optional<
  UserMedicationAttributes,
  | "id"
  | "dosage"
  | "dosageMeasurement"
  | "frequency"
  | "notes"
  | "active"
> {}

export class UserMedication
  extends Model<UserMedicationAttributes, UserMedicationCreationAttributes>
  implements UserMedicationAttributes
{
  declare id: string;
  declare userId: string;
  declare medicationId: string;
  declare dosage: number | undefined;
  declare dosageMeasurement: DosageMeasurement | undefined;
  declare frequency: string | undefined;
  declare notes: string | undefined;
  declare active: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof UserMedication {
    UserMedication.init(
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
        medicationId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "medications", key: "id" },
          onDelete: "NO ACTION",
        },
        dosage: {
          type: DataTypes.FLOAT,
          allowNull: true,
          validate: { min: 0 },
        },
        dosageMeasurement: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        frequency: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        active: activeColumn,
        ...timestampColumns,
      },
      {
        sequelize,
        tableName: "user_medications",
        timestamps: true,
        underscored: true,
        ...softDeleteModelOptions,
        indexes: [
          {
            unique: true,
            fields: ["user_id", "medication_id"],
            where: { active: true },
            name: "user_medications_user_medication_active_unique",
          },
        ],
        validate: {
          hasPairedDosage(this: UserMedication) {
            const hasDosage = this.dosage != null;
            const hasMeasurement = this.dosageMeasurement != null;

            if (hasDosage !== hasMeasurement) {
              throw new Error(
                "UserMedication must have both dosage and dosageMeasurement, or neither.",
              );
            }
          },
        },
      },
    );
    return UserMedication;
  }
}
