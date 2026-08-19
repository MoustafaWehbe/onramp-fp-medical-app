import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { homePathForRole } from "../../lib/auth/roles";
import { type LoginLocationState } from "../../lib/auth/location-state";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import { FormField } from "./FormField";
import { PasswordField } from "./PasswordField";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as LoginLocationState | null) ?? null;
  const justRegistered = Boolean(locationState?.registered);
  const prefillEmail = locationState?.email ?? "";
  const [error, setError] = useState<string | null>(locationState?.loginError ?? null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: prefillEmail },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      const loggedIn = await login(data.email, data.password);
      navigate(homePathForRole(loggedIn.role));
    } catch {
      setError("Invalid email or password");
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
        <h1 className="font-display text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Enter your credentials to open your HealthTrack record.
        </p>
      </header>

      {justRegistered && (
        <p
          role="status"
          className="rounded-xl border border-primary/20 bg-primary/10 px-3.5 py-3 text-sm text-foreground"
        >
          Account created. Sign in to start your first log.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <FormField id="email" label="Email" error={errors.email?.message}>
        <Input type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
      </FormField>

      <FormField id="password" label="Password" error={errors.password?.message}>
        <PasswordField autoComplete="current-password" placeholder="••••••••" {...register("password")} />
      </FormField>

      <Button type="submit" className="w-full rounded-full shadow-glow" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
        {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" aria-hidden />}
      </Button>
    </form>
  );
}
