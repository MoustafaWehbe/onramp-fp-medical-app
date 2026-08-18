import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface ReportSectionProps {
  title: string;
  items?: string[] | null;
  icon?: LucideIcon;
  className?: string;
}

export function ReportSection({
  title,
  items,
  icon: Icon,
  className,
}: ReportSectionProps) {
  const list = (Array.isArray(items) ? items : []).filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );

  return (
    <section
      className={cn(
        "rounded-2xl border border-border/80 bg-card p-4 shadow-soft sm:p-5",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        {Icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        )}
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">None recorded.</p>
      ) : (
        <ul className="space-y-2">
          {list.map((item) => (
            <li
              key={item}
              className="rounded-xl bg-muted/40 px-3 py-2 text-sm leading-6"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
