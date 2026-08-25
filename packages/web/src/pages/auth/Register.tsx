import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { homePathForRole } from "../../lib/auth/roles";
import { type LoginLocationState } from "../../lib/auth/location-state";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import { FormField } from "./FormField";
import { PasswordField } from "./PasswordField";

const registerSchema = z.object({
  name: z.string().min(2, "auth.nameLength"),
  email: z.string().email("auth.invalidEmail"),
  password: z
    .string()
    .min(8, "auth.passwordLength")
    .regex(/[A-Z]/, "auth.uppercaseRequired")
    .regex(/[0-9]/, "auth.numberRequired"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function Register() {
  const { t } = useTranslation();
  const { user, isLoading, register: registerUser, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);

    // ── 1. Create the account ────────────────────────────────────────────────
    try {
      await registerUser(data.email, data.password, data.name);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setError(t("auth.registerConflict"));
      } else {
        setError(t("auth.registerFailed"));
      }
      return;
    }

    // ── 2. Auto-login (registration already succeeded — do not retry it) ─────
    try {
      const loggedInUser = await login(data.email, data.password);
      navigate(loggedInUser.role === "admin" ? "/admin" : "/onboarding", { replace: true });
    } catch {
      const state: LoginLocationState = {
        registered: true,
        email: data.email,
        loginError: t("auth.autoLoginFailed"),
      };
      navigate("/login", { state, replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (user) return <Navigate to={homePathForRole(user.role)} replace />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-sm space-y-5">
      <header className="space-y-1.5 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight">{t("auth.createAccount")}</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {t("auth.registerBody")}
        </p>
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <FormField id="name" label={t("auth.name")} error={errors.name?.message ? t(errors.name.message) : undefined}>
        <Input autoComplete="name" placeholder={t("auth.namePlaceholder")} {...register("name")} />
      </FormField>

      <FormField id="email" label={t("auth.email")} error={errors.email?.message ? t(errors.email.message) : undefined}>
        <Input type="email" autoComplete="email" placeholder={t("auth.emailPlaceholder")} {...register("email")} />
      </FormField>

      <FormField
        id="password"
        label={t("auth.password")}
        error={errors.password?.message ? t(errors.password.message) : undefined}
        description={t("auth.passwordHint")}
      >
        <PasswordField autoComplete="new-password" placeholder="••••••••" {...register("password")} />
      </FormField>

      <Button type="submit" className="w-full rounded-full shadow-glow" disabled={isSubmitting}>
        {isSubmitting ? t("auth.registering") : t("auth.createAccount")}
        {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" aria-hidden />}
      </Button>
    </form>
  );
}
