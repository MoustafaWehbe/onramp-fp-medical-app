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
    <Card className={cn("", className)}>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>

          <p className="text-2xl font-bold tracking-tight">
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
