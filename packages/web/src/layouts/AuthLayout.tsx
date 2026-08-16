import { Outlet } from "react-router-dom";
import { BrandMark } from "../components/layout/BrandMark";

export function AuthLayout() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_38%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.10),transparent_34%)]" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <BrandMark />
          <p className="text-sm text-muted-foreground">
            Your health, clearly organized.
          </p>
        </div>
        <Outlet />
      </div>
    </main>
  );
}
