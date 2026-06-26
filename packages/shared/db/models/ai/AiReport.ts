import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface AiReportContent {
  summary?: string;
  conditions?: string[];
  medications?: string[];
  symptoms?: string[];
  recommendations?: string[];
  [key: string]: unknown;
}

export interface AiReportAttributes {
  id: string;
  userId: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  reportContent: AiReportContent;
  createdAt?: Date;
}

export interface AiReportCreationAttributes
  extends Optional<AiReportAttributes, "id"> {}

export class AiReport
  extends Model<AiReportAttributes, AiReportCreationAttributes>
  implements AiReportAttributes
{
  declare id: string;
  declare userId: string;
  declare dateRangeStart: string;
  declare dateRangeEnd: string;
  declare reportContent: AiReportContent;
  declare readonly createdAt: Date;

  static initModel(sequelize: Sequelize): typeof AiReport {
    AiReport.init(
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
        dateRangeStart: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        dateRangeEnd: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        reportContent: {
          type: DataTypes.JSONB,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "ai_reports",
        timestamps: true,
        updatedAt: false,
        underscored: true,
      },
    );
    return AiReport;
  }
}
