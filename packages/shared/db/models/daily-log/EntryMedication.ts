import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface EntryMedicationAttributes {
  id: string;
  entryId: string;
  userMedicationId: string;
  quantity: number;
  unit: string;
  taken: boolean;
  takenAt?: Date;
  notes?: string;
  createdAt?: Date;
}

export interface EntryMedicationCreationAttributes extends Optional<
  EntryMedicationAttributes,
  "id" | "quantity" | "taken" | "takenAt" | "notes"
> {}

export class EntryMedication
  extends Model<EntryMedicationAttributes, EntryMedicationCreationAttributes>
  implements EntryMedicationAttributes
{
  declare id: string;
  declare entryId: string;
  declare userMedicationId: string;
  declare quantity: number;
  declare unit: string;
  declare taken: boolean;
  declare takenAt: Date | undefined;
  declare notes: string | undefined;
  declare readonly createdAt: Date;

  static initModel(sequelize: Sequelize): typeof EntryMedication {
    EntryMedication.init(
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
        userMedicationId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "user_medications", key: "id" },
          onDelete: "RESTRICT",
        },
        quantity: {
          type: DataTypes.SMALLINT,
          defaultValue: 1,
          allowNull: false,
          validate: { min: 1 },
        },
        unit: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        taken: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        takenAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "entry_medications",
        timestamps: true,
        updatedAt: false,
        underscored: true,
        indexes: [
          {
            unique: true,
            fields: ["entry_id", "user_medication_id", "taken_at"],
          },
        ],
      },
    );
    return EntryMedication;
  }
}
