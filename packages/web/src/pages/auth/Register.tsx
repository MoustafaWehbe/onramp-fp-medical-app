import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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
  const { user, isLoading, register: registerUser } = useAuth();
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
    try {
      setError(null);
      await registerUser(data.email, data.password, data.name);
      navigate("/login", { state: { registered: true } });
    } catch {
      setError("Registration failed. That email may already be in use.");
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

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          autoComplete="name"
          placeholder="Alice Smith"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "register-name-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id="register-name-error" className="text-xs text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "register-email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p id="register-email-error" className="text-xs text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordField
          id="password"
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "register-password-error" : undefined}
          {...register("password")}
        />
        {errors.password && (
          <p id="register-password-error" className="text-xs text-destructive">
            {errors.password.message}
          </p>
        )}
        <p className="text-xs leading-5 text-muted-foreground">
          At least 8 characters, with one uppercase letter and one number.
        </p>
      </div>

      <Button type="submit" className="w-full rounded-full shadow-glow" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create account"}
        {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" aria-hidden />}
      </Button>
    </form>
  );
}
