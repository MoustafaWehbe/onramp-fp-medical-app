import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface UserClinicAttributes {
  id: string;
  userId: string;
  clinicId?: string;
  customName?: string;
  notes?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserClinicCreationAttributes extends Optional<
  UserClinicAttributes,
  "id" | "clinicId" | "customName" | "notes" | "active"
> {}

export class UserClinic
  extends Model<UserClinicAttributes, UserClinicCreationAttributes>
  implements UserClinicAttributes
{
  declare id: string;
  declare userId: string;
  declare clinicId: string | undefined;
  declare customName: string | undefined;
  declare notes: string | undefined;
  declare active: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof UserClinic {
    UserClinic.init(
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
        clinicId: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: "clinics", key: "id" },
          onDelete: "SET NULL",
        },
        customName: {
          type: DataTypes.STRING(255),
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
        tableName: "user_clinics",
        timestamps: true,
        underscored: true,
        validate: {
          hasCatalogOrCustomName(this: UserClinic) {
            const hasCatalog = this.clinicId != null;
            const hasCustomName = this.customName != null;

            if (hasCatalog === hasCustomName) {
              throw new Error(
                "UserClinic must have either clinicId or customName.",
              );
            }
          },
        },
      },
    );
    return UserClinic;
  }
}
