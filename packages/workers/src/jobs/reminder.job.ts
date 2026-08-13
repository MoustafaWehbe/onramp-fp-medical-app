import type { Job } from "bullmq";
import {
  User,
  UserReminderSettings,
  DailyEntry,
  emailQueue,
  type ReminderJobData,
  type ReminderJobResult,
} from "@starter-kit/shared";

function getUserLocalDate(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getUserLocalTime(timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export async function processReminderJob(
  job: Job<ReminderJobData, ReminderJobResult>,
): Promise<ReminderJobResult> {
  console.info(`[reminder] Checking reminder settings...`);

  const reminderSettings = await UserReminderSettings.findAll({
    where: {
      enabled: true,
    },
  });

  console.info(
    `[reminder] Checking ${reminderSettings.length} enabled reminder(s)`,
  );

  let remindersQueued = 0;

  for (const settings of reminderSettings) {
    if (!settings.reminderTime) {
      continue;
    }

    const currentTime = getUserLocalTime(settings.timezone);
    const configuredTime = settings.reminderTime.slice(0, 5);

    if (currentTime !== configuredTime) {
      continue;
    }

    const today = getUserLocalDate(settings.timezone);

    const existingEntry = await DailyEntry.findOne({
      where: {
        userId: settings.userId,
        entryDate: today,
      },
    });

    if (existingEntry) {
      continue;
    }

    const user = await User.findByPk(settings.userId);

    if (!user) {
      console.warn(
        `[reminder] User ${settings.userId} no longer exists`,
      );
      continue;
    }

    const reminderJobId = `daily-entry-reminder:${settings.userId}:${today}`;
    await emailQueue.add(
        "daily-entry-reminder",
        {
            to: user.email,
            subject: "Don't forget to complete your daily entry",
            template: "daily-entry-reminder",
            variables: {
            name: user.name,
            },
        },
        {
            jobId: reminderJobId,
        },
    );

    console.info(
  `[reminder] Email job added to queue: ${reminderJobId}`,
);
    remindersQueued++;

    console.info(
      `[reminder] Queued daily entry reminder for ${user.email}`,
    );
  }

  return { remindersQueued };
}