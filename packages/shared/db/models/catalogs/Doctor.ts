import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";
import { timestampColumns } from "../timestamps";

export interface DoctorAttributes {
  id: string;
  name: string;
  specialty?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  declare readonly updatedAt: Date;

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
        ...timestampColumns,
      },
      {
        sequelize,
        tableName: "doctors",
        timestamps: true,
        underscored: true,
        indexes: [{ unique: true, fields: ["name", "specialty", "phone"] }],
      },
    );
    return Doctor;
  }
}
