import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface SectionPanelProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionPanel({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  contentClassName,
}: SectionPanelProps) {
  return (
    <section className={cn("overflow-hidden rounded-[1.5rem] border border-border/80 bg-card shadow-soft", className)}>
      <div className="flex flex-col gap-4 border-b border-border/70 bg-muted/20 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className={cn("p-4 sm:p-6", contentClassName)}>{children}</div>
    </section>
  );
}

