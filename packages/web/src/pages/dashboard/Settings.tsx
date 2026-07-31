import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../hooks/useAuth";
import {
  SettingsProvider,
  useSettingsContext,
} from "../../providers/SettingsProvider";
import {
  updateEmailSchema,
  updatePasswordSchema,
  deleteAccountSchema,
  type UpdateEmailFormValues,
  type UpdatePasswordFormValues,
  type DeleteAccountFormValues,
} from "../../lib/settings/settings-export";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

function SettingsView() {
  const { user, logout, updateUser } = useAuth();
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

  const [profileOpen, setProfileOpen] = useState(false);
  const [emailFormOpen, setEmailFormOpen] = useState(false);
  const [passwordFormOpen, setPasswordFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const cancelledRef = useRef(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account information.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent>
          {!profileOpen ? (
            <Button size="sm" onClick={() => setProfileOpen(true)}>
              View Profile
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Name</span>
                  <span>{user?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span>{user?.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Role</span>
                  <span className="capitalize">{user?.role}</span>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setProfileOpen(false)}>
                Hide
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Email</CardTitle>
          <CardDescription>Change your email address</CardDescription>
        </CardHeader>
        <CardContent>
          {emailSuccess ? (
            <div className="space-y-3">
              <p className="text-sm text-green-600">{emailSuccess}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  clearEmailStatus();
                  setEmailFormOpen(true);
                }}
              >
                Change Again
              </Button>
            </div>
          ) : !emailFormOpen ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Current email: <span className="text-foreground">{user?.email}</span>
              </p>
              <Button size="sm" onClick={() => setEmailFormOpen(true)}>
                Change Email
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleEmailSubmit(onUpdateEmail)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email-current-password">Current Password</Label>
                <Input
                  id="email-current-password"
                  type="password"
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
                <Label htmlFor="new-email">New Email</Label>
                <Input
                  id="new-email"
                  type="email"
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
                  {isEmailBusy ? "Updating..." : "Update Email"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  disabled={isEmailBusy}
                  onClick={() => {
                    resetEmail({ currentPassword: "", newEmail: "" });
                    setEmailFormOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          {passwordSuccess ? (
            <div className="space-y-2">
              <p className="text-sm text-green-600">{passwordSuccess}</p>
              <p className="text-sm text-muted-foreground">
                Redirecting to login...
              </p>
            </div>
          ) : !passwordFormOpen ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Password: <span className="text-foreground">{"\u2022".repeat(12)}</span>
              </p>
              <Button size="sm" onClick={() => setPasswordFormOpen(true)}>
                Change Password
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handlePasswordSubmit(onUpdatePassword)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="password-current-password">
                  Current Password
                </Label>
                <Input
                  id="password-current-password"
                  type="password"
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
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
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
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-new-password"
                  type="password"
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
                  {isPasswordBusy ? "Updating..." : "Change Password"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  disabled={isPasswordBusy}
                  onClick={() => {
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
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Delete Account</CardTitle>
          <CardDescription>
            Permanently delete your account and all data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!deleteConfirmOpen ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              Delete My Account
            </Button>
          ) : (
            <form
              onSubmit={handleDeleteSubmit(onDeleteAccount)}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                Enter your current password to confirm deletion. This action cannot
                be undone.
              </p>

              <div className="space-y-2">
                <Label htmlFor="delete-current-password">
                  Current Password
                </Label>
                <Input
                  id="delete-current-password"
                  type="password"
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
                  {isDeleteBusy
                    ? "Deleting..."
                    : "Confirm Delete"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  disabled={isDeleteBusy}
                  onClick={() => {
                    resetDelete({ currentPassword: "" });
                    setDeleteConfirmOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
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
