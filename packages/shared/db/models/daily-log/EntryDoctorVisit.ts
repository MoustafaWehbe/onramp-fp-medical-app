import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";
import { timestampColumns } from "../timestamps";

export interface EntryDoctorVisitAttributes {
  id: string;
  entryId: string;
  userDoctorId: string;
  userClinicId?: string;
  summary?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EntryDoctorVisitCreationAttributes extends Optional<
  EntryDoctorVisitAttributes,
  "id" | "userClinicId" | "summary" | "notes"
> {}

export class EntryDoctorVisit
  extends Model<EntryDoctorVisitAttributes, EntryDoctorVisitCreationAttributes>
  implements EntryDoctorVisitAttributes
{
  declare id: string;
  declare entryId: string;
  declare userDoctorId: string;
  declare userClinicId: string | undefined;
  declare summary: string | undefined;
  declare notes: string | undefined;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof EntryDoctorVisit {
    EntryDoctorVisit.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        entryId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "daily_entries", key: "id" },
          onDelete: "CASCADE",
        },
        userDoctorId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "user_doctors", key: "id" },
          onDelete: "RESTRICT",
        },
        userClinicId: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: "user_clinics", key: "id" },
          onDelete: "SET NULL",
        },
        summary: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        ...timestampColumns,
      },
      {
        sequelize,
        tableName: "entry_doctor_visits",
        timestamps: true,
        underscored: true,
        indexes: [{ unique: true, fields: ["entry_id", "user_doctor_id"] }],
      },
    );
    return EntryDoctorVisit;
  }
}
