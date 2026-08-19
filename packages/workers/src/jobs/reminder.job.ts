import type { Job } from "bullmq";
import {
  User,
  UserReminderSettings,
  DailyEntry,
  emailQueue,
  toHhMm,
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

function minutesSinceMidnight(hhmm: string): number {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
}

export async function processReminderJob(
  _job: Job<ReminderJobData, ReminderJobResult>,
): Promise<ReminderJobResult> {
  console.info(`[reminder] Checking reminder settings...`);

  const reminderSettings = await UserReminderSettings.findAll({
    where: {
      enabled: true,
    },
    include: [{ model: User, as: "user", required: false }],
  });

  const settingsByTimezone = new Map<string, UserReminderSettings[]>();

  for (const settings of reminderSettings) {
    const timezone = settings.timezone || "UTC";
    const group = settingsByTimezone.get(timezone) ?? [];
    group.push(settings);
    settingsByTimezone.set(timezone, group);
  }

  console.info(
    `[reminder] Checking ${reminderSettings.length} enabled reminder(s) across ${settingsByTimezone.size} timezone(s)`,
  );

  let remindersQueued = 0;

  for (const [timezone, settingsGroup] of settingsByTimezone) {
    let clock: { date: string; time: string };

    try {
      clock = getClockParts(timezone);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      for (const settings of settingsGroup) {
        console.error(
          `[reminder] failed processing ${settings.userId}: ${message}`,
        );
      }
      continue;
    }

    const { date: today, time: currentTime } = clock;
    const currentMinutes = minutesSinceMidnight(currentTime);
    const dueSettings = settingsGroup.filter((settings) => {
      const configuredTime = toHhMm(settings.reminderTime);
      return (
        configuredTime != null &&
        currentMinutes >= minutesSinceMidnight(configuredTime)
      );
    });

    for (const settings of dueSettings) {
      try {
        const configuredTime = toHhMm(settings.reminderTime);
        if (!configuredTime) {
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

        const user = settings.get("user") as User | undefined;

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
              subject:
                settings.language === "ar"
                  ? "تذكير بإكمال إدخالك اليومي"
                  : "Don't forget to complete your daily entry",
              template: "daily-entry-reminder",
              variables: {
                name: user.name,
              },
              userId: settings.userId,
              localDate: today,
              language: settings.language ?? "en",
            },
            {
              jobId: reminderJobId,
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
          `[reminder] Queued daily entry reminder for ${settings.userId} (${reminderJobId}) now=${currentTime} want=${configuredTime} tz=${timezone}`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          `[reminder] failed processing ${settings.userId}: ${message}`,
        );
      }
    }
  }

  return { remindersQueued };
}
