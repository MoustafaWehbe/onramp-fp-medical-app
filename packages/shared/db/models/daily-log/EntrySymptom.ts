import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface EntrySymptomAttributes {
  id: string;
  entryId: string;
  userSymptomId: string;
  severity?: number;
  notes?: string;
  createdAt?: Date;
}

export interface EntrySymptomCreationAttributes extends Optional<
  EntrySymptomAttributes,
  "id" | "severity" | "notes"
> {}

export class EntrySymptom
  extends Model<EntrySymptomAttributes, EntrySymptomCreationAttributes>
  implements EntrySymptomAttributes
{
  declare id: string;
  declare entryId: string;
  declare userSymptomId: string;
  declare severity: number | undefined;
  declare notes: string | undefined;
  declare readonly createdAt: Date;

  static initModel(sequelize: Sequelize): typeof EntrySymptom {
    EntrySymptom.init(
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
        userSymptomId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "user_symptoms", key: "id" },
          onDelete: "RESTRICT",
        },
        severity: {
          type: DataTypes.SMALLINT,
          allowNull: true,
          validate: { min: 1, max: 10 },
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "entry_symptoms",
        timestamps: true,
        updatedAt: false,
        underscored: true,
        indexes: [{ unique: true, fields: ["entry_id", "user_symptom_id"] }],
      },
    );
    return EntrySymptom;
  }
}
