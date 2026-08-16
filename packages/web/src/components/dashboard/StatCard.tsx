import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "../../lib/utils";
import { Card, CardContent } from "../ui/card";
import type { LucideIcon } from "lucide-react";
import { prefersReducedMotion } from "../../lib/motion";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  className?: string;
}

function formatCount(value: number, original: string | number) {
  if (typeof original === "string" && original.includes(".")) {
    return value.toFixed(1);
  }
  return String(Math.round(value));
}

export function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  className,
}: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLParagraphElement>(null);
  const numericValue = typeof value === "number" ? value : Number(value);
  const canCount = Number.isFinite(numericValue);

  useGSAP(
    () => {
      const valueEl = valueRef.current;
      if (!valueEl || !canCount) return;

      if (prefersReducedMotion()) {
        valueEl.textContent = formatCount(numericValue, value);
        return;
      }

      const counter = { n: 0 };
      gsap.to(counter, {
        n: numericValue,
        duration: 0.85,
        ease: "power2.out",
        onUpdate: () => {
          valueEl.textContent = formatCount(counter.n, value);
        },
      });
    },
    { scope: cardRef, dependencies: [value] },
  );

  return (
    <Card
      ref={cardRef}
      className={cn(
        "overflow-hidden border-border/70 bg-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-glow",
        className,
      )}
    >
      <CardContent className="flex items-center gap-4 p-4 sm:p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 text-primary ring-1 ring-primary/10">
          <Icon className="h-5 w-5" aria-hidden />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>

          <p ref={valueRef} className="font-display text-2xl font-bold tabular-nums tracking-tight">
            {canCount ? formatCount(0, value) : value}
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
