import { reminderQueue } from "@starter-kit/shared";

console.log(reminderQueue);

export async function scheduleReminderJob(): Promise<void> {
  await reminderQueue.upsertJobScheduler(
    "daily-reminder-check",
    {
      every: 60_000,
    },
    {
      name: "check-daily-reminders",
      data: {},
    },
  );

  console.info(
    "[scheduler] Daily reminder job scheduled every minute",
  );
}