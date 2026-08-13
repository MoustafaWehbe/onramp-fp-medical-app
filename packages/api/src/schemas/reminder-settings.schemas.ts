import { z } from "zod";

const reminderTimeSchema = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    "Reminder time must be in HH:mm format",
  );

  const timezoneSchema = z
  .string()
  .trim()
  .min(1, "Timezone is required")
  .refine(
    (timezone) => {
      try {
        Intl.DateTimeFormat(undefined, {
          timeZone: timezone,
        });

        return true;
      } catch {
        return false;
      }
    },
    {
      message: "Invalid timezone",
    },
  );

export const updateReminderSettingsSchema = z
  .object({
    enabled: z.boolean(),

    reminderTime: reminderTimeSchema.nullable().optional(),
    timezone:timezoneSchema,
  })
  .superRefine((data, ctx) => {
    if (data.enabled && !data.reminderTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reminderTime"],
        message: "Reminder time is required when reminders are enabled",
      });
    }
  });
