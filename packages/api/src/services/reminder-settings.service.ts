import { UniqueConstraintError } from "sequelize";
import { toHhMm } from "@starter-kit/shared";

import { UserReminderSettings } from "../models";

interface UpdateReminderSettingsInput {
  enabled: boolean;
  reminderTime?: string | null;
  timezone?: string;
  language?: "en" | "ar";
}

async function findOrCreateByUserId(
  userId: string,
  defaults: {
    userId: string;
    enabled: boolean;
    reminderTime: string | null;
    timezone: string;
    language: "en" | "ar";
  },
) {
  try {
    return await UserReminderSettings.findOrCreate({
      where: { userId },
      defaults,
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      const existing = await UserReminderSettings.findOne({ where: { userId } });
      if (existing) {
        return [existing, false] as const;
      }
    }

    throw error;
  }
}

export class ReminderSettingsService {
  async getSettings(userId: string) {
    const [settings] = await findOrCreateByUserId(userId, {
      userId,
      enabled: false,
      reminderTime: null,
      timezone: "UTC",
      language: "en",
    });

    return {
      enabled: settings.enabled,
      reminderTime: toHhMm(settings.reminderTime),
      timezone: settings.timezone,
      language: settings.language,
    };
  }

  async updateSettings(
    userId: string,
    input: UpdateReminderSettingsInput,
  ) {
    const [settings, created] = await findOrCreateByUserId(userId, {
      userId,
      enabled: input.enabled,
      reminderTime:
        input.reminderTime !== undefined ? input.reminderTime : null,
      timezone: input.timezone ?? "UTC",
      language: input.language ?? "en",
    });

    if (!created) {
      await settings.update({
        enabled: input.enabled,
        ...(input.reminderTime !== undefined
          ? { reminderTime: input.reminderTime }
          : {}),
        ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
        ...(input.language !== undefined ? { language: input.language } : {}),
      });
    }

    return {
      enabled: settings.enabled,
      reminderTime: toHhMm(settings.reminderTime),
      timezone: settings.timezone,
      language: settings.language,
    };
  }
}

export const reminderSettingsService = new ReminderSettingsService();
