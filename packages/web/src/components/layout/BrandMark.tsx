import { HeartPulse } from "lucide-react";
import { cn } from "../../lib/utils";

interface BrandMarkProps {
  compact?: boolean;
  className?: string;
}

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow">
        <HeartPulse className="h-5 w-5" aria-hidden />
      </span>
      {!compact && (
        <span className="truncate font-display text-base font-bold tracking-tight">
          Health<span className="text-primary">Track</span>
        </span>
      )}
    </span>
  );
}
