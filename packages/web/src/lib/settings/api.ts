import { apiClient } from "../api-client";
import type { DataResponse } from "../api/types";
import type {
  UpdateEmailRequest,
  UpdatePasswordRequest,
  DeleteAccountRequest,
  ReminderSettings,
  ReminderSettingsFormValues,
} from "./types";

export function updateEmail(body: UpdateEmailRequest) {
  return apiClient.patch<
    DataResponse<{ message: string; email: string }>
  >("/users/me/email", body);
}

export function updatePassword(body: UpdatePasswordRequest) {
  return apiClient.patch<
    DataResponse<{ message: string }>
  >("/users/me/password", body);
}

export function deleteAccount(body: DeleteAccountRequest) {
  return apiClient.delete<
    DataResponse<{ message: string }>
  >("/users/me", { data: body });
}

export function getReminderSettings() {
  return apiClient.get<DataResponse<ReminderSettings>>(
    "/reminder-settings/me"
  );
}

export function updateReminderSettings(
  body: ReminderSettingsFormValues
) {
  return apiClient.patch<DataResponse<ReminderSettings>>(
    "/reminder-settings/me",
    body
  );
}