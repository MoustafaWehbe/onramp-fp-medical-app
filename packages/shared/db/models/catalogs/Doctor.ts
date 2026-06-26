import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface DoctorAttributes {
  id: string;
  name: string;
  specialty?: string;
  phone?: string;
  createdAt?: Date;
}

export interface DoctorCreationAttributes
  extends Optional<DoctorAttributes, "id" | "specialty" | "phone"> {}

export class Doctor
  extends Model<DoctorAttributes, DoctorCreationAttributes>
  implements DoctorAttributes
{
  declare id: string;
  declare name: string;
  declare specialty: string | undefined;
  declare phone: string | undefined;
  declare readonly createdAt: Date;

  static initModel(sequelize: Sequelize): typeof Doctor {
    Doctor.init(
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
        specialty: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        phone: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "doctors",
        timestamps: true,
        updatedAt: false,
        underscored: true,
      },
    );
    return Doctor;
  }
}
