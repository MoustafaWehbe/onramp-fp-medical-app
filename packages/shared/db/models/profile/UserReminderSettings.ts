import {
  Model,
  DataTypes,
  type Sequelize,
  type Optional,
} from "sequelize";

export interface UserReminderSettingsAttributes {
  id: string;
  userId: string;
  enabled: boolean;
  reminderTime: string | null;
  timezone: string;
  language: "en" | "ar";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserReminderSettingsCreationAttributes
  extends Optional<
    UserReminderSettingsAttributes,
    "id" | "reminderTime"
  > {}

export class UserReminderSettings
  extends Model<
    UserReminderSettingsAttributes,
    UserReminderSettingsCreationAttributes
  >
  implements UserReminderSettingsAttributes
{
  declare id: string;
  declare userId: string;
  declare enabled: boolean;
  declare reminderTime: string | null;
  declare timezone: string;
  declare language: "en" | "ar";

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof UserReminderSettings {
    UserReminderSettings.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },

        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          unique: true,
          references: {
            model: "users",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },

        enabled: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },

        reminderTime: {
          type: DataTypes.TIME,
          allowNull: true,
        },
        timezone: {
          type: DataTypes.STRING(100),
          allowNull: false,
          defaultValue: "UTC",
        },
        language: {
          type: DataTypes.STRING(2),
          allowNull: false,
          defaultValue: "en",
          validate: { isIn: [["en", "ar"]] },
        },
      },
        
      {
        sequelize,
        tableName: "user_reminder_settings",
        timestamps: true,
        underscored: true,
      },
    );

    return UserReminderSettings;
  }
}