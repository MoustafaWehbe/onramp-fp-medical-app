export interface UpdateEmailRequest {
  currentPassword: string;
  newEmail: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountRequest {
  currentPassword: string;
}

export interface ReminderSettings {
  enabled: boolean;
  reminderTime: string | null;
  timezone: string;
  language: "en" | "ar";
}

export interface ReminderSettingsFormValues {
  enabled: boolean;
  reminderTime : string | null;
  timezone: string;
  language: "en" | "ar";
}