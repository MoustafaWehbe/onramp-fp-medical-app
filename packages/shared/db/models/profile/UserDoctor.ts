import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface UserDoctorAttributes {
  id: string;
  userId: string;
  doctorId?: string;
  customName?: string;
  userClinicId?: string;
  notes?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserDoctorCreationAttributes extends Optional<
  UserDoctorAttributes,
  "id" | "doctorId" | "customName" | "userClinicId" | "notes" | "active"
> {}

export class UserDoctor
  extends Model<UserDoctorAttributes, UserDoctorCreationAttributes>
  implements UserDoctorAttributes
{
  declare id: string;
  declare userId: string;
  declare doctorId: string | undefined;
  declare customName: string | undefined;
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
          allowNull: true,
          references: { model: "doctors", key: "id" },
          onDelete: "SET NULL",
        },
        customName: {
          type: DataTypes.STRING(255),
          allowNull: true,
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
        active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "user_doctors",
        timestamps: true,
        underscored: true,
        validate: {
          hasCatalogOrCustomName(this: UserDoctor) {
            const hasCatalog = this.doctorId != null;
            const hasCustomName = this.customName != null;

            if (hasCatalog === hasCustomName) {
              throw new Error(
                "UserDoctor must have either doctorId or customName.",
              );
            }
          },
        },
      },
    );
    return UserDoctor;
  }
}
