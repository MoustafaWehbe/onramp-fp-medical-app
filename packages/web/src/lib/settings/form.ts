import { z } from "zod";

export const timezoneOptions = [
  "UTC",
  "Asia/Beirut",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const;

export const timezoneLabels: Record<(typeof timezoneOptions)[number], string> = {
  UTC: "UTC",
  "Asia/Beirut": "Beirut (UTC+3)",
  "Europe/London": "London",
  "Europe/Paris": "Paris",
  "Europe/Berlin": "Berlin",
  "America/New_York": "New York",
  "America/Los_Angeles": "Los Angeles",
  "Asia/Dubai": "Dubai",
  "Asia/Riyadh": "Riyadh",
  "Asia/Tokyo": "Tokyo",
  "Australia/Sydney": "Sydney",
};

export const updateEmailSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newEmail: z.string().email("Invalid email address"),
});

export type UpdateEmailFormValues = z.infer<typeof updateEmailSchema>;

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

export const deleteAccountSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
});

export type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;

export const reminderSettingsSchema = z
  .object({
    enabled: z.boolean(),

    reminderTime: z.preprocess(
      (value) => {
        if (value === "" || value == null) {
          return null;
        }

        if (typeof value === "string") {
          const match = value.match(/^(\d{2}:\d{2})/);
          return match ? match[1] : value;
        }

        return value;
      },
      z
        .string()
        .regex(
          /^([01]\d|2[0-3]):[0-5]\d$/,
          "Reminder time must be in HH:mm format",
        )
        .nullable(),
    ),

    timezone: z.enum(timezoneOptions, {
      errorMap: () => ({ message: "Timezone is required" }),
    }),
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