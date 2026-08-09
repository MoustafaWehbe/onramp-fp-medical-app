import { cn } from "../../lib/utils";

interface ReportSectionProps {
  title: string;
  items?: string[] | null;
  className?: string;
}

export function ReportSection({
  title,
  items,
  className,
}: ReportSectionProps) {
  const list = (items ?? []).filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );

  return (
    <section className={cn("space-y-3", className)}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">None recorded.</p>
      ) : (
        <ul className="list-inside list-disc space-y-1.5 text-sm leading-6 text-foreground">
          {list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
