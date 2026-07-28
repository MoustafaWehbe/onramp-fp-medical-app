import { Activity, Tag } from "lucide-react";
import type { UserSymptom } from "../../../lib/health/health-export";
import { cn } from "../../../lib/utils";
import { useSymptomsContext } from "../../../providers/SymptomsProvider";

interface SymptomCardProps {
  symptom: UserSymptom;
}

export function SymptomCard({ symptom }: SymptomCardProps) {
  const { selectedId, openDetail } = useSymptomsContext();
  const selected = selectedId === symptom.id;
  const { name, category } = symptom.catalog;

  return (
    <button
      type="button"
      onClick={() => openDetail(symptom)}
      className={cn(
        "group w-full rounded-xl border bg-card p-4 text-left shadow-sm transition-all",
        "hover:border-primary/40 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "border-primary ring-2 ring-primary/20",
      )}
    >
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          <Activity className="h-5 w-5" aria-hidden />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="truncate font-semibold leading-tight tracking-tight">
              {name}
            </h3>
            {category && (
              <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                <Tag className="h-3 w-3" aria-hidden />
                {category}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export function SymptomDetail() {
  const { panel } = useSymptomsContext();
  if (panel.kind !== "detail") return null;

  const symptom = panel.symptom;
  const { name, category } = symptom.catalog;

  const rows = [
    category
      ? { icon: Tag, label: "Category", value: category }
      : null,
  ].filter(Boolean) as Array<{
    icon: typeof Activity;
    label: string;
    value: string;
  }>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Activity className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold leading-tight">{name}</p>
          <p className="text-sm text-muted-foreground">Tracked symptom</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No additional details recorded.
        </p>
      ) : (
        <dl className="space-y-3">
          {rows.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex gap-3 rounded-lg border bg-muted/30 px-3 py-2.5"
            >
              <Icon
                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <div className="min-w-0">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-0.5 text-sm">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
