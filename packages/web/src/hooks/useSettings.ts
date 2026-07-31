import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateEmail,
  updatePassword,
  deleteAccount,
} from "../lib/settings/settings-export";

export const settingsKeys = {
  all: ["settings"] as const,
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
