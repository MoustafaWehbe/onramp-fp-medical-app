import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";
import { timestampColumns } from "../timestamps";

export interface ClinicAttributes {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClinicCreationAttributes
  extends Optional<ClinicAttributes, "id" | "address" | "phone"> {}

export class Clinic
  extends Model<ClinicAttributes, ClinicCreationAttributes>
  implements ClinicAttributes
{
  declare id: string;
  declare name: string;
  declare address: string | undefined;
  declare phone: string | undefined;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof Clinic {
    Clinic.init(
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
        address: {
          type: DataTypes.TEXT,
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
        tableName: "clinics",
        timestamps: true,
        underscored: true,
        indexes: [{ unique: true, fields: ["name", "phone"] }],
      },
    );
    return Clinic;
  }
}
