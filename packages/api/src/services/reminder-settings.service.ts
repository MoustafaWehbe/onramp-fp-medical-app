import { UserReminderSettings } from "../models";

interface UpdateReminderSettingsInput {
  enabled: boolean;
  reminderTime?: string | null;
  timezone?: string;
}

export class ReminderSettingsService {
  async getSettings(userId: string) {
    let settings = await UserReminderSettings.findOne({
      where: { userId },
    });

    // Create default settings for users who don't have a record yet
    if (!settings) {
      settings = await UserReminderSettings.create({
        userId,
        enabled: false,
        reminderTime: null,
        timezone: "UTC",
      });
    }

    return {
      enabled: settings.enabled,
      reminderTime: settings.reminderTime,
      timezone: settings.timezone
    };
  }

  async updateSettings(
    userId: string,
    input: UpdateReminderSettingsInput,
  ) {
    let settings = await UserReminderSettings.findOne({
      where: { userId },
    });

    if (!settings) {
      settings = await UserReminderSettings.create({
        userId,
        enabled: input.enabled,
        reminderTime: input.reminderTime ?? null,
        timezone: input.timezone ?? "UTC",
      });
    } else {
      await settings.update({
        enabled: input.enabled,
        reminderTime: input.reminderTime ?? null,
        timezone: input.timezone ?? settings.timezone,
      });
    }

    return {
      enabled: settings.enabled,
      reminderTime: settings.reminderTime,
      timezone: settings.timezone
    };
  }
}

export const reminderSettingsService = new ReminderSettingsService();