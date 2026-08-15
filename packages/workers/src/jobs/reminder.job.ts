import type { Job } from "bullmq";
import {
  User,
  UserReminderSettings,
  DailyEntry,
  emailQueue,
  type ReminderJobData,
  type ReminderJobResult,
} from "@starter-kit/shared";

function getClockParts(timezone: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const read = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    date: `${read("year")}-${read("month").padStart(2, "0")}-${read("day").padStart(2, "0")}`,
    time: `${read("hour").padStart(2, "0")}:${read("minute").padStart(2, "0")}`,
  };
}

function toHhMm(value: string | Date): string | null {
  if (value instanceof Date) {
    // TIME is a wall-clock value; Sequelize Date wrappers are UTC-based.
    return `${String(value.getUTCHours()).padStart(2, "0")}:${String(value.getUTCMinutes()).padStart(2, "0")}`;
  }

  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    return null;
  }

  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function minutesSinceMidnight(hhmm: string): number {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
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
      console.info(
        `[reminder] skip ${settings.userId}: reminder enabled but no reminderTime`,
      );
      continue;
    }

    const { date: today, time: currentTime } = getClockParts(settings.timezone);
    const configuredTime = toHhMm(settings.reminderTime);

    if (!configuredTime) {
      console.info(
        `[reminder] skip ${settings.userId}: could not parse reminderTime`,
      );
      continue;
    }

    if (minutesSinceMidnight(currentTime) < minutesSinceMidnight(configuredTime)) {
      console.info(
        `[reminder] skip ${settings.userId}: now=${currentTime} want=${configuredTime} tz=${settings.timezone} (too early)`,
      );
      continue;
    }

    const existingEntry = await DailyEntry.findOne({
      where: {
        userId: settings.userId,
        entryDate: today,
      },
    });

    if (existingEntry) {
      console.info(
        `[reminder] skip ${settings.userId}: already has daily entry for ${today}`,
      );
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
    const existingJob = await emailQueue.getJob(reminderJobId);

    if (existingJob) {
      const state = await existingJob.getState();

      if (state === "completed" || state === "active" || state === "waiting" || state === "delayed") {
        console.info(
          `[reminder] email job already ${state} for ${today}: ${reminderJobId}`,
        );
        continue;
      }

      if (state === "failed") {
        await existingJob.remove();
        console.info(
          `[reminder] removed failed email job so it can retry: ${reminderJobId}`,
        );
      }
    }

    try {
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
          removeOnFail: true,
        },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.toLowerCase().includes("already exists")) {
        console.info(
          `[reminder] email job already queued for ${today}: ${reminderJobId}`,
        );
        continue;
      }
      throw error;
    }

    remindersQueued++;

    console.info(
      `[reminder] Queued daily entry reminder for ${user.email} (${reminderJobId}) now=${currentTime} want=${configuredTime} tz=${settings.timezone}`,
    );
  }

  return { remindersQueued };
}
