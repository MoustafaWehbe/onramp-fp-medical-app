import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Sun, TriangleAlert } from "lucide-react";
import { Bell } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  SettingsProvider,
  useSettingsContext,
} from "../../providers/SettingsProvider";
import {
  updateEmailSchema,
  updatePasswordSchema,
  deleteAccountSchema,
  reminderSettingsSchema,
  type UpdateEmailFormValues,
  type UpdatePasswordFormValues,
  type DeleteAccountFormValues,
  type ReminderSettingsFormValues,

} from "../../lib/settings/settings-export";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useTheme } from "../../providers/ThemeProvider";

import {
  useReminderSettings,
  useUpdateReminderSettings,
} from "../../hooks/useSettings";

function SettingsView() {
  const { user, logout, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const reminderSettingsQuery = useReminderSettings();
  const updateReminderSettingsMutation = useUpdateReminderSettings();
  const {
    isEmailBusy,
    isPasswordBusy,
    isDeleteBusy,
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
  } = useSettingsContext();

  const navigate = useNavigate();

  const {
    register: emailRegister,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
    reset: resetEmail,
  } = useForm<UpdateEmailFormValues>({
    resolver: zodResolver(updateEmailSchema),
  });

  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const {
    register: deleteRegister,
    handleSubmit: handleDeleteSubmit,
    formState: { errors: deleteErrors },
    reset: resetDelete,
  } = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
  });

  const {
  register: reminderRegister,
  handleSubmit: handleReminderSubmit,
  watch: watchReminder,
  reset: resetReminder,
  setValue: setReminderValue,
  formState: { errors: reminderErrors },
} = useForm<ReminderSettingsFormValues>({
  resolver: zodResolver(reminderSettingsSchema),
  defaultValues: {
    enabled: false,
    reminderTime: null,
    timezone: "UTC",
  },
});

  const [profileOpen, setProfileOpen] = useState(false);
  const [emailFormOpen, setEmailFormOpen] = useState(false);
  const [passwordFormOpen, setPasswordFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const cancelledRef = useRef(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reminderEnabled = watchReminder("enabled");

  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

useEffect(() => {
  const settings = reminderSettingsQuery.data?.data.data;

  if (settings) {
    resetReminder({
      enabled: settings.enabled,
      reminderTime: settings.reminderTime?.slice(0, 5) ?? null,
      timezone: settings.timezone,
    });
  }
}, [reminderSettingsQuery.data, resetReminder]);

  async function onUpdateEmail(values: UpdateEmailFormValues) {
    try {
      await submitUpdateEmail(values);
      updateUser({ email: values.newEmail });
      resetEmail({ currentPassword: "", newEmail: "" });
      setEmailFormOpen(false);
    } catch {
      // error set by provider
    }
  }

  async function onUpdatePassword(values: UpdatePasswordFormValues) {
    try {
      await submitUpdatePassword(values);
      if (cancelledRef.current) return;
      redirectTimer.current = setTimeout(() => {
        void logout()
          .catch(() => undefined)
          .finally(() => navigate("/login", { replace: true }));
      }, 2000);
    } catch {
      // error set by provider
    }
  }

  async function onDeleteAccount(values: DeleteAccountFormValues) {
    try {
      await submitDeleteAccount(values);
    } catch {
      return;
    }
    try {
      await logout();
    } catch {
      // session is already dead; user state is cleared by logout()
    }
    navigate("/login", { replace: true });
  }

  async function onUpdateReminderSettings(
    values: ReminderSettingsFormValues,
  ) {
    try {
      await updateReminderSettingsMutation.mutateAsync(values);
    } catch {
      // handle error if needed
    }
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

    const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC" },
  { value: "Asia/Beirut", label: "Beirut (UTC+3)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "America/New_York", label: "New York" },
  { value: "America/Los_Angeles", label: "Los Angeles" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Riyadh", label: "Riyadh" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Australia/Sydney", label: "Sydney" },
];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account information.</p>
      </div>

      {/* Account */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Account</h2>
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() => setProfileOpen((p) => !p)}
              >
                {profileOpen ? "Hide" : "View profile"}
              </Button>
            </div>
            {profileOpen && (
              <>
                <div className="border-t" />
                <div className="space-y-2 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{user?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium capitalize">{user?.role}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Security */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Security</h2>
        <Card>
          <CardContent className="p-0">
            {/* Email row */}
            <div className="flex items-center gap-4 p-4">
              <Mail className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">Update email</p>
                <p className="text-sm text-muted-foreground truncate">
                  {emailSuccess
                    ? emailSuccess
                    : user?.email}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() => {
                  if (emailSuccess) {
                    clearEmailStatus();
                    resetEmail({ currentPassword: "", newEmail: "" });
                    setEmailFormOpen(true);
                  } else {
                    clearEmailStatus();
                    resetEmail({ currentPassword: "", newEmail: "" });
                    setEmailFormOpen((e) => !e);
                  }
                }}
              >
                {emailFormOpen && !emailSuccess ? "Cancel" : "Change"}
              </Button>
            </div>
            {emailFormOpen && !emailSuccess && (
              <>
                <div className="border-t" />
                <form
                  onSubmit={handleEmailSubmit(onUpdateEmail)}
                  className="space-y-4 p-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email-current-password">Current password</Label>
                    <Input
                      id="email-current-password"
                      type="password"
                      className="bg-muted border-muted-foreground/50"
                      disabled={isEmailBusy}
                      {...emailRegister("currentPassword")}
                    />
                    {emailErrors.currentPassword && (
                      <p className="text-xs text-destructive">
                        {emailErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-email">New email</Label>
                    <Input
                      id="new-email"
                      type="email"
                      className="bg-muted border-muted-foreground/50"
                      disabled={isEmailBusy}
                      {...emailRegister("newEmail")}
                    />
                    {emailErrors.newEmail && (
                      <p className="text-xs text-destructive">
                        {emailErrors.newEmail.message}
                      </p>
                    )}
                  </div>

                  {emailError && (
                    <p className="text-sm text-destructive">{emailError}</p>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" type="submit" disabled={isEmailBusy}>
                      {isEmailBusy ? "Updating..." : "Update email"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      disabled={isEmailBusy}
                      onClick={() => {
                        clearEmailStatus();
                        resetEmail({ currentPassword: "", newEmail: "" });
                        setEmailFormOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </>
            )}

            <div className="border-t" />

            {/* Password row */}
            <div className="flex items-center gap-4 p-4">
              <Lock className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">Change password</p>
                <p className="text-sm text-muted-foreground">
                  {passwordSuccess
                    ? "Redirecting to login..."
                    : "Update your password"}
                </p>
              </div>
              {passwordSuccess ? (
                <span className="text-sm text-green-600 shrink-0">
                  {passwordSuccess}
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => {
                    clearPasswordStatus();
                    resetPassword({
                      currentPassword: "",
                      newPassword: "",
                      confirmNewPassword: "",
                    });
                    setPasswordFormOpen((p) => !p);
                  }}
                >
                  {passwordFormOpen ? "Cancel" : "Change"}
                </Button>
              )}
            </div>
            {passwordFormOpen && !passwordSuccess && (
              <>
                <div className="border-t" />
                <form
                  onSubmit={handlePasswordSubmit(onUpdatePassword)}
                  className="space-y-4 p-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="password-current-password">
                      Current password
                    </Label>
                    <Input
                      id="password-current-password"
                      type="password"
                      className="bg-muted border-muted-foreground/50"
                      disabled={isPasswordBusy}
                      {...passwordRegister("currentPassword")}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-xs text-destructive">
                        {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      className="bg-muted border-muted-foreground/50"
                      disabled={isPasswordBusy}
                      {...passwordRegister("newPassword")}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-xs text-destructive">
                        {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">
                      Confirm new password
                    </Label>
                    <Input
                      id="confirm-new-password"
                      type="password"
                      className="bg-muted border-muted-foreground/50"
                      disabled={isPasswordBusy}
                      {...passwordRegister("confirmNewPassword")}
                    />
                    {passwordErrors.confirmNewPassword && (
                      <p className="text-xs text-destructive">
                        {passwordErrors.confirmNewPassword.message}
                      </p>
                    )}
                  </div>

                  {passwordError && (
                    <p className="text-sm text-destructive">{passwordError}</p>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" type="submit" disabled={isPasswordBusy}>
                      {isPasswordBusy ? "Updating..." : "Change password"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      disabled={isPasswordBusy}
                      onClick={() => {
                        clearPasswordStatus();
                        resetPassword({
                          currentPassword: "",
                          newPassword: "",
                          confirmNewPassword: "",
                        });
                        setPasswordFormOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Preferences */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Preferences</h2>
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center gap-4 p-4">
              <Sun className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred appearance
                </p>
              </div>
              <div className="flex shrink-0 rounded-md border">
                <button
                  type="button"
                  className={`px-3 py-1.5 text-sm font-medium rounded-l-md transition-colors ${
                    theme === "light"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  aria-pressed={theme === "light"}
                  onClick={() => setTheme("light")}
                >
                  Light
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 text-sm font-medium rounded-r-md transition-colors ${
                    theme === "dark"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  aria-pressed={theme === "dark"}
                  onClick={() => setTheme("dark")}
                >
                  Dark
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Reminder Settings */}
<section className="space-y-3">
  <h2 className="text-sm font-medium text-muted-foreground">
    Reminders
  </h2>

  <Card>
    <CardContent className="p-0">
      <form
        onSubmit={handleReminderSubmit(onUpdateReminderSettings)}
        className="space-y-4 p-4"
      >
        <div className="flex items-center gap-4">
          <Bell className="h-5 w-5 shrink-0 text-muted-foreground" />

          <div className="flex-1 min-w-0">
            <p className="font-medium">Daily entry reminder</p>
            <p className="text-sm text-muted-foreground">
              Receive an email reminder if you haven't completed your daily
              entry.
            </p>
          </div>

          <label className="flex items-center gap-2 shrink-0">
            <input
              type="checkbox"
              {...reminderRegister("enabled", {
                onChange: (e) => {
                  if (!e.target.checked) {
                    setReminderValue("reminderTime", null);
                  }
                },
              })}
              disabled={updateReminderSettingsMutation.isPending}
              className="h-4 w-4"
            />
            <span className="text-sm">
              {watchReminder("enabled") ? "Enabled" : "Disabled"}
            </span>
          </label>
        </div>

        <div className="border-t" />

        <div className="space-y-2">
          <Label htmlFor="reminder-time">
            Reminder time
          </Label>

          <Input
            id="reminder-time"
            type="time"
            disabled={
              !watchReminder("enabled") ||
              updateReminderSettingsMutation.isPending
            }
            {...reminderRegister("reminderTime")}
            className="bg-muted border-muted-foreground/50"
          />

          {reminderErrors.reminderTime && (
            <p className="text-xs text-destructive">
              {reminderErrors.reminderTime.message}
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            You will receive the reminder at this time every day.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminder-timezone">
            Timezone
          </Label>

          <select
    id="reminder-timezone"
    disabled={ !watchReminder("enabled") || updateReminderSettingsMutation.isPending}
    {...reminderRegister("timezone")}
    className="flex h-10 w-full rounded-md border border-muted-foreground/50 bg-muted px-3 py-2 text-sm"
  >
    {TIMEZONE_OPTIONS.map((timezone) => (
      <option key={timezone.value} value={timezone.value}>
        {timezone.label}
      </option>
    ))}
  </select>

  {reminderErrors.timezone && (
    <p className="text-xs text-destructive">
      {reminderErrors.timezone.message}
    </p>
  )}

  <p className="text-xs text-muted-foreground">
    Select the timezone where you want to receive your daily reminder.
  </p>
        </div>

        {reminderSettingsQuery.isError && (
          <p className="text-sm text-destructive">
            Failed to load reminder settings.
          </p>
        )}

        {updateReminderSettingsMutation.isError && (
          <p className="text-sm text-destructive">
            Failed to update reminder settings.
          </p>
        )}

        {updateReminderSettingsMutation.isSuccess && (
          <p className="text-sm text-green-600">
            Reminder settings updated successfully.
          </p>
        )}

        <Button
          size="sm"
          type="submit"
          disabled={
            reminderSettingsQuery.isLoading ||
            updateReminderSettingsMutation.isPending
          }
        >
          {updateReminderSettingsMutation.isPending
            ? "Saving..."
            : "Save reminder settings"}
        </Button>
      </form>
    </CardContent>
  </Card>
</section>

      {/* Danger zone */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Danger zone</h2>
        <Card className="border-destructive/30 bg-destructive/20">
          <CardContent className="p-0">
            <div className="flex items-center gap-4 p-4">
              <TriangleAlert className="h-5 w-5 shrink-0 text-destructive" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-destructive">Delete account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently remove your account and all data
                </p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="shrink-0"
                onClick={() => {
                  clearDeleteStatus();
                  resetDelete({ currentPassword: "" });
                  setDeleteConfirmOpen((d) => !d);
                }}
              >
                {deleteConfirmOpen ? "Cancel" : "Delete"}
              </Button>
            </div>
            {deleteConfirmOpen && (
              <>
                <div className="border-t border-destructive/30" />
                <form
                  onSubmit={handleDeleteSubmit(onDeleteAccount)}
                  className="space-y-4 p-4"
                >
                  <p className="text-sm text-muted-foreground">
                    Enter your current password to confirm deletion. This action
                    cannot be undone.
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="delete-current-password">
                      Current password
                    </Label>
                    <Input
                      id="delete-current-password"
                      type="password"
                      className="bg-muted border-muted-foreground/50"
                      disabled={isDeleteBusy}
                      {...deleteRegister("currentPassword")}
                    />
                    {deleteErrors.currentPassword && (
                      <p className="text-xs text-destructive">
                        {deleteErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  {deleteError && (
                    <p className="text-sm text-destructive">{deleteError}</p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      type="submit"
                      disabled={isDeleteBusy}
                    >
                      {isDeleteBusy ? "Deleting..." : "Confirm delete"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      disabled={isDeleteBusy}
                      onClick={() => {
                        clearDeleteStatus();
                        resetDelete({ currentPassword: "" });
                        setDeleteConfirmOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export function Settings() {
  return (
    <SettingsProvider>
      <SettingsView />
    </SettingsProvider>
  );
}
