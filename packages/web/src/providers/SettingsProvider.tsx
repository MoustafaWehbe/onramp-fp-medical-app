import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { isAxiosError } from "axios";
import {
  useUpdateEmail,
  useUpdatePassword,
  useDeleteAccount,
} from "../hooks/useSettings";
import type {
  UpdateEmailFormValues,
  UpdatePasswordFormValues,
  DeleteAccountFormValues,
} from "../lib/settings/settings-export";

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined;
    if (data?.error) return data.error;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

interface SettingsContextValue {
  isEmailBusy: boolean;
  isPasswordBusy: boolean;
  isDeleteBusy: boolean;

  emailError: string | null;
  passwordError: string | null;
  deleteError: string | null;

  emailSuccess: string | null;
  passwordSuccess: string | null;

  submitUpdateEmail: (values: UpdateEmailFormValues) => Promise<{ newEmail: string }>;
  submitUpdatePassword: (values: UpdatePasswordFormValues) => Promise<void>;
  submitDeleteAccount: (values: DeleteAccountFormValues) => Promise<void>;

  clearEmailStatus: () => void;
  clearPasswordStatus: () => void;
  clearDeleteStatus: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const updateEmailMutation = useUpdateEmail();
  const updatePasswordMutation = useUpdatePassword();
  const deleteAccountMutation = useDeleteAccount();

    async function submitUpdateEmail(values: UpdateEmailFormValues) {
      setEmailError(null);
      setEmailSuccess(null);
      try {
        await updateEmailMutation.mutateAsync({
          currentPassword: values.currentPassword,
          newEmail: values.newEmail,
        });
        setEmailSuccess("Email updated successfully.");
        return { newEmail: values.newEmail };
      } catch (error) {
        setEmailError(
          getErrorMessage(error, "Failed to update email"),
        );
        throw error;
      }
    }

  async function submitUpdatePassword(values: UpdatePasswordFormValues) {
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      await updatePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setPasswordSuccess("Password updated successfully. Please log in again.");
    } catch (error) {
      setPasswordError(
        getErrorMessage(error, "Failed to update password"),
      );
      throw error;
    }
  }

  async function submitDeleteAccount(values: DeleteAccountFormValues) {
    setDeleteError(null);
    try {
      await deleteAccountMutation.mutateAsync({
        currentPassword: values.currentPassword,
      });
    } catch (error) {
      setDeleteError(
        getErrorMessage(error, "Failed to delete account"),
      );
      throw error;
    }
  }

  function clearEmailStatus() {
    setEmailError(null);
    setEmailSuccess(null);
  }

  function clearPasswordStatus() {
    setPasswordError(null);
    setPasswordSuccess(null);
  }

  function clearDeleteStatus() {
    setDeleteError(null);
  }

  const value = useMemo<SettingsContextValue>(
    () => ({
      isEmailBusy: updateEmailMutation.isPending,
      isPasswordBusy: updatePasswordMutation.isPending,
      isDeleteBusy: deleteAccountMutation.isPending,

      emailError,
      passwordError,
      deleteError,

      emailSuccess,
      passwordSuccess,

      submitUpdateEmail,
      submitUpdatePassword,
      submitDeleteAccount,

      clearEmailStatus,
      clearPasswordStatus,
      clearDeleteStatus,
    }),
    [
      updateEmailMutation.isPending,
      updatePasswordMutation.isPending,
      deleteAccountMutation.isPending,
      emailError,
      passwordError,
      deleteError,
      emailSuccess,
      passwordSuccess,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error(
      "useSettingsContext must be used within <SettingsProvider>",
    );
  return ctx;
}
