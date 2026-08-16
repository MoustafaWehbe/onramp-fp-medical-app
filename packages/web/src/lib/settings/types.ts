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
}

export interface ReminderSettingsFormValues {
  enabled: boolean;
  reminderTime : string | null;
  timezone: string;
}