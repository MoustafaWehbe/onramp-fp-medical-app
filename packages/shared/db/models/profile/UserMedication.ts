import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface UserMedicationAttributes {
  id: string;
  userId: string;
  medicationId?: string;
  customName?: string;
  frequency?: string;
  notes?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserMedicationCreationAttributes extends Optional<
  UserMedicationAttributes,
  "id" | "medicationId" | "customName" | "frequency" | "notes" | "active"
> {}

export class UserMedication
  extends Model<UserMedicationAttributes, UserMedicationCreationAttributes>
  implements UserMedicationAttributes
{
  declare id: string;
  declare userId: string;
  declare medicationId: string | undefined;
  declare customName: string | undefined;
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
          allowNull: true,
          references: { model: "medications", key: "id" },
          onDelete: "SET NULL",
        },
        customName: {
          type: DataTypes.STRING(255),
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
        active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "user_medications",
        timestamps: true,
        underscored: true,
        validate: {
          hasCatalogOrCustomName(this: UserMedication) {
            const hasCatalog = this.medicationId != null;
            const hasCustomName = this.customName != null;

            if (hasCatalog === hasCustomName) {
              throw new Error(
                "UserMedication must have either medicationId or customName.",
              );
            }
          },
        },
      },
    );
    return UserMedication;
  }
}
