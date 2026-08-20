import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { useSettingsContext } from "../../providers/SettingsProvider";
import {
  updateEmailSchema,
  updatePasswordSchema,
  type UpdateEmailFormValues,
  type UpdatePasswordFormValues,
} from "../../lib/settings/settings-export";
import { SectionPanel } from "../shared/SectionPanel";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function SecurityPanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout, updateUser } = useAuth();
  const {
    isEmailBusy,
    isPasswordBusy,
    emailError,
    passwordError,
    emailSuccess,
    passwordSuccess,
    submitUpdateEmail,
    submitUpdatePassword,
    clearEmailStatus,
    clearPasswordStatus,
  } = useSettingsContext();
  const [emailOpen, setEmailOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const logoutTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (logoutTimerRef.current != null) {
        window.clearTimeout(logoutTimerRef.current);
      }
    };
  }, []);

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

  async function onUpdateEmail(values: UpdateEmailFormValues) {
    try {
      await submitUpdateEmail(values);
      updateUser({ email: values.newEmail });
      resetEmail({ currentPassword: "", newEmail: "" });
      setEmailOpen(false);
    } catch {
      // error set by provider
    }
  }

  async function onUpdatePassword(values: UpdatePasswordFormValues) {
    try {
      await submitUpdatePassword(values);
      logoutTimerRef.current = window.setTimeout(() => {
        void logout()
          .catch(() => undefined)
          .finally(() => navigate("/login", { replace: true }));
      }, 2000);
    } catch {
      // error set by provider
    }
  }

  return (
    <SectionPanel
      title={t("settings.security.title")}
      description={t("settings.security.description")}
      icon={Lock}
    >
      <div className="space-y-3">
        <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <Mail className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-semibold">{t("settings.security.emailAddress")}</p>
              <p className="text-sm text-muted-foreground">
                {emailSuccess ?? t("settings.security.emailStatusChange")}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              clearEmailStatus();
              resetEmail({ currentPassword: "", newEmail: "" });
              setEmailOpen((open) => !open);
            }}
          >
            {emailOpen ? t("common.cancel") : t("common.change")}
          </Button>
        </div>

        {emailOpen && (
          <form
            onSubmit={handleEmailSubmit(onUpdateEmail)}
            className="space-y-4 rounded-2xl border border-border/70 p-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email-current-password">{t("settings.security.currentPassword")}</Label>
              <Input
                id="email-current-password"
                type="password"
                autoComplete="current-password"
                disabled={isEmailBusy}
                {...emailRegister("currentPassword")}
              />
              {emailErrors.currentPassword && (
                <p className="text-sm text-destructive">
                  {emailErrors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">{t("settings.security.newEmail")}</Label>
              <Input
                id="new-email"
                type="email"
                autoComplete="email"
                disabled={isEmailBusy}
                {...emailRegister("newEmail")}
              />
              {emailErrors.newEmail && (
                <p className="text-sm text-destructive">
                  {emailErrors.newEmail.message}
                </p>
              )}
            </div>
            {emailError && (
              <p role="alert" className="text-sm text-destructive">
                {emailError}
              </p>
            )}
            <Button type="submit" disabled={isEmailBusy}>
              {isEmailBusy ? t("settings.security.updatingEmail") : t("settings.security.updateEmail")}
            </Button>
          </form>
        )}

        <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <Lock className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-semibold">{t("settings.security.password")}</p>
              <p className="text-sm text-muted-foreground">
                {passwordSuccess
                  ? t("settings.security.passwordRedirect")
                  : t("settings.security.passwordHint")}
              </p>
            </div>
          </div>
          {passwordSuccess ? (
            <p className="text-sm font-semibold text-primary">{passwordSuccess}</p>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                clearPasswordStatus();
                resetPassword({
                  currentPassword: "",
                  newPassword: "",
                  confirmNewPassword: "",
                });
                setPasswordOpen((open) => !open);
              }}
            >
              {passwordOpen ? t("common.cancel") : t("common.change")}
            </Button>
          )}
        </div>

        {passwordOpen && !passwordSuccess && (
          <form
            onSubmit={handlePasswordSubmit(onUpdatePassword)}
            className="space-y-4 rounded-2xl border border-border/70 p-4"
          >
            <div className="space-y-2">
              <Label htmlFor="password-current-password">{t("settings.security.currentPassword")}</Label>
              <Input
                id="password-current-password"
                type="password"
                autoComplete="current-password"
                disabled={isPasswordBusy}
                {...passwordRegister("currentPassword")}
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-destructive">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">{t("settings.security.newPassword")}</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                disabled={isPasswordBusy}
                {...passwordRegister("newPassword")}
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-destructive">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">{t("settings.security.confirmNewPassword")}</Label>
              <Input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                disabled={isPasswordBusy}
                {...passwordRegister("confirmNewPassword")}
              />
              {passwordErrors.confirmNewPassword && (
                <p className="text-sm text-destructive">
                  {passwordErrors.confirmNewPassword.message}
                </p>
              )}
            </div>
            {passwordError && (
              <p role="alert" className="text-sm text-destructive">
                {passwordError}
              </p>
            )}
            <Button type="submit" disabled={isPasswordBusy}>
              {isPasswordBusy ? "Updating…" : "Change password"}
            </Button>
          </form>
        )}
      </div>
    </SectionPanel>
  );
}
