import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { homePathForRole } from "../../lib/auth/roles";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import { PasswordField } from "./PasswordField";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginLocationState {
  registered?: boolean;
}

export function Login() {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const justRegistered = Boolean((location.state as LoginLocationState | null)?.registered);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
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

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p id="login-email-error" className="text-xs text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordField
          id="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "login-password-error" : undefined}
          {...register("password")}
        />
        {errors.password && (
          <p id="login-password-error" className="text-xs text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full rounded-full shadow-glow" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
        {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" aria-hidden />}
      </Button>
    </form>
  );
}
