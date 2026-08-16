import { z } from "zod";

const reminderTimeSchema = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/,
    "Reminder time must be in HH:mm format",
  )
  .transform((value) => value.slice(0, 5));

  const timezoneSchema = z
  .string()
  .trim()
  .min(1, "Timezone is required")
  .refine(
    (timezone) => {
      try {
        if (typeof Intl.supportedValuesOf === "function") {
          return Intl.supportedValuesOf("timeZone").includes(timezone);
        }

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
