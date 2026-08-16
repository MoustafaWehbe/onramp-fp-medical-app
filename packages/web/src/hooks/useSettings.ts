import {useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateEmail,
  updatePassword,
  deleteAccount,
  getReminderSettings,
  updateReminderSettings,
  
} from "../lib/settings/settings-export";

export const settingsKeys = {
  all: ["settings"] as const,
  reminders: ["settings", "reminders"] as const,
};

export function useUpdateEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEmail,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}

export function useUpdatePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useReminderSettings() {
  return useQuery({
    queryKey: settingsKeys.reminders,
    queryFn: getReminderSettings,
  });
}

export function useUpdateReminderSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReminderSettings,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: settingsKeys.all,
      });
    },
  });
}
