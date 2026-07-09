import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";
import { timestampColumns } from "../timestamps";
import { activeColumn, softDeleteModelOptions } from "../soft-delete";

export interface UserDoctorAttributes {
  id: string;
  userId: string;
  doctorId: string;
  userClinicId?: string;
  notes?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserDoctorCreationAttributes extends Optional<
  UserDoctorAttributes,
  "id" | "userClinicId" | "notes" | "active"
> {}

export class UserDoctor
  extends Model<UserDoctorAttributes, UserDoctorCreationAttributes>
  implements UserDoctorAttributes
{
  declare id: string;
  declare userId: string;
  declare doctorId: string;
  declare userClinicId: string | undefined;
  declare notes: string | undefined;
  declare active: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof UserDoctor {
    UserDoctor.init(
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
        doctorId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "doctors", key: "id" },
          onDelete: "NO ACTION",
        },
        userClinicId: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: "user_clinics", key: "id" },
          onDelete: "SET NULL",
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
        tableName: "user_doctors",
        timestamps: true,
        underscored: true,
        ...softDeleteModelOptions,
        indexes: [
          {
            unique: true,
            fields: ["user_id", "doctor_id"],
            where: { active: true },
            name: "user_doctors_user_doctor_active_unique",
          },
        ],
      },
    );
    return UserDoctor;
  }
}
