import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface DailyEntryAttributes {
  id: string;
  userId: string;
  entryDate: string;
  moodRating?: number;
  sleepHours?: number;
  journalNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DailyEntryCreationAttributes extends Optional<
  DailyEntryAttributes,
  "id" | "moodRating" | "sleepHours" | "journalNotes"
> {}

export class DailyEntry
  extends Model<DailyEntryAttributes, DailyEntryCreationAttributes>
  implements DailyEntryAttributes
{
  declare id: string;
  declare userId: string;
  declare entryDate: string;
  declare moodRating: number | undefined;
  declare sleepHours: number | undefined;
  declare journalNotes: string | undefined;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof DailyEntry {
    DailyEntry.init(
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
        entryDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        moodRating: {
          type: DataTypes.SMALLINT,
          allowNull: true,
          validate: { min: 1, max: 5 },
        },
        sleepHours: {
          type: DataTypes.FLOAT,
          allowNull: true,
          validate: { min: 0, max: 24 },
        },
        journalNotes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "daily_entries",
        timestamps: true,
        underscored: true,
        indexes: [{ unique: true, fields: ["user_id", "entry_date"] }],
      },
    );
    return DailyEntry;
  }
}
