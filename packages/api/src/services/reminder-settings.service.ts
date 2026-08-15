import { UserReminderSettings } from "../models";

interface UpdateReminderSettingsInput {
  enabled: boolean;
  reminderTime?: string | null;
  timezone?: string;
}

function toHhMm(value: string | Date | null): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return `${String(value.getUTCHours()).padStart(2, "0")}:${String(value.getUTCMinutes()).padStart(2, "0")}`;
  }

  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : null;
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
      reminderTime: toHhMm(settings.reminderTime),
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
      reminderTime: toHhMm(settings.reminderTime),
      timezone: settings.timezone
    };
  }
}

export const reminderSettingsService = new ReminderSettingsService();