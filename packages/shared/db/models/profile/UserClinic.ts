import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";
import { timestampColumns } from "../timestamps";
import { activeColumn, softDeleteModelOptions } from "../soft-delete";

export interface UserClinicAttributes {
  id: string;
  userId: string;
  clinicId: string;
  notes?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserClinicCreationAttributes extends Optional<
  UserClinicAttributes,
  "id" | "notes" | "active"
> {}

export class UserClinic
  extends Model<UserClinicAttributes, UserClinicCreationAttributes>
  implements UserClinicAttributes
{
  declare id: string;
  declare userId: string;
  declare clinicId: string;
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
          allowNull: false,
          references: { model: "clinics", key: "id" },
          onDelete: "NO ACTION",
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
        tableName: "user_clinics",
        timestamps: true,
        underscored: true,
        ...softDeleteModelOptions,
        indexes: [
          {
            unique: true,
            fields: ["user_id", "clinic_id"],
            where: { active: true },
            name: "user_clinics_user_clinic_active_unique",
          },
        ],
      },
    );
    return UserClinic;
  }
}
