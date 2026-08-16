import { cn } from "../../lib/utils";
import { Card, CardContent } from "../ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lift", className)}>
      <CardContent className="flex items-center gap-4 p-4 sm:p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
          <Icon className="h-5 w-5" aria-hidden />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>

          <p className="text-2xl font-bold tabular-nums tracking-tight">
            {value}
          </p>

          {subtext && (
            <p className="truncate text-xs text-muted-foreground">
              {subtext}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
