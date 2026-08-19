import { useState } from "react";
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
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function Register() {
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
        setError("Registration failed. That email may already be in use.");
      } else {
        setError("Registration failed. Please try again.");
      }
      return;
    }

    // ── 2. Auto-login (registration already succeeded — do not retry it) ─────
    try {
      await login(data.email, data.password);
      navigate("/onboarding", { replace: true });
    } catch {
      const state: LoginLocationState = {
        registered: true,
        email: data.email,
        loginError: "Your account was created but we couldn't sign you in automatically. Please sign in.",
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
        <h1 className="font-display text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          A few details now, then you can log today in minutes.
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

      <FormField id="name" label="Name" error={errors.name?.message}>
        <Input autoComplete="name" placeholder="Alice Smith" {...register("name")} />
      </FormField>

      <FormField id="email" label="Email" error={errors.email?.message}>
        <Input type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
      </FormField>

      <FormField
        id="password"
        label="Password"
        error={errors.password?.message}
        description="At least 8 characters, with one uppercase letter and one number."
      >
        <PasswordField autoComplete="new-password" placeholder="••••••••" {...register("password")} />
      </FormField>

      <Button type="submit" className="w-full rounded-full shadow-glow" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create account"}
        {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" aria-hidden />}
      </Button>
    </form>
  );
}
