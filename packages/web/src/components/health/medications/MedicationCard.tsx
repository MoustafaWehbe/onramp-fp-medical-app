import {
  Clock,
  FlaskConical,
  NotebookPen,
  Pill,
  Tag,
} from "lucide-react";
import {
  formatMedicationDosage,
  type UserMedication,
} from "../../../lib/health/health-export";
import { cn } from "../../../lib/utils";
import { useMedicationsContext } from "../../../providers/MedicationsProvider";

interface MedicationCardProps {
  medication: UserMedication;
}

export function MedicationCard({ medication }: MedicationCardProps) {
  const { selectedId, openDetail } = useMedicationsContext();
  const selected = selectedId === medication.id;
  const dosageLabel = formatMedicationDosage(medication);
  const { name, strength, category } = medication.medication;

  return (
    <button
      type="button"
      onClick={() => openDetail(medication)}
      className={cn(
        "group w-full rounded-xl border bg-card p-4 text-left shadow-sm transition-all",
        "hover:border-primary/40 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "border-primary ring-2 ring-primary/20",
      )}
    >
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          <Pill className="h-5 w-5" aria-hidden />
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

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            {strength && (
              <span className="inline-flex items-center gap-1.5">
                <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {strength}
              </span>
            )}
            {dosageLabel && (
              <span className="inline-flex items-center gap-1.5">
                <Pill className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {dosageLabel}
              </span>
            )}
            {medication.frequency && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {medication.frequency}
              </span>
            )}
          </div>

          {medication.notes && (
            <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <NotebookPen
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                aria-hidden
              />
              <span className="line-clamp-2">{medication.notes}</span>
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export function MedicationDetail() {
  const { panel } = useMedicationsContext();
  if (panel.kind !== "detail") return null;

  const medication = panel.medication;
  const dosageLabel = formatMedicationDosage(medication);
  const { name, strength, category } = medication.medication;

  const rows = [
    strength
      ? { icon: FlaskConical, label: "Strength", value: strength }
      : null,
    category ? { icon: Tag, label: "Category", value: category } : null,
    dosageLabel
      ? { icon: Pill, label: "Dosage", value: dosageLabel }
      : null,
    medication.frequency
      ? { icon: Clock, label: "Frequency", value: medication.frequency }
      : null,
    medication.notes
      ? { icon: NotebookPen, label: "Notes", value: medication.notes }
      : null,
  ].filter(Boolean) as Array<{
    icon: typeof Pill;
    label: string;
    value: string;
  }>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Pill className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold leading-tight">{name}</p>
          <p className="text-sm text-muted-foreground">Active medication</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No dosage or schedule details yet.
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
