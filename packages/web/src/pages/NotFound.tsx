import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { buttonVariants } from "../components/ui/button";
import { BrandMark } from "../components/layout/BrandMark";
import { cn } from "../lib/utils";

export function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_38%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.10),transparent_34%)]" />
      <div className="relative w-full max-w-md rounded-[1.75rem] border border-primary/15 bg-card px-6 py-12 text-center shadow-lift">
        <div className="mb-6 flex justify-center">
          <BrandMark />
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          That link does not match a screen in HealthTrack.
        </p>
        <Link to="/" className={cn(buttonVariants(), "mt-6")}>
          <Home className="mr-1.5 h-4 w-4" aria-hidden />
          Go home
        </Link>
      </div>
    </div>
  );
}
