import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface PageHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
  icon?: LucideIcon;
  badge?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  icon: Icon,
  badge,
  action,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-primary/15 bg-card px-5 py-6 shadow-soft sm:px-7 sm:py-8",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-44 w-44 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {Icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md sm:h-14 sm:w-14">
              <Icon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
            </div>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                {eyebrow}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                {title}
              </h1>
              {badge}
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
        </div>
        {action && <div className="relative shrink-0 sm:self-center">{action}</div>}
      </div>
    </header>
  );
}

