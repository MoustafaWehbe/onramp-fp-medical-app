import { Building2, MapPin, NotebookPen, Phone } from "lucide-react";
import type { UserClinic } from "../../../lib/health/health-export";
import { cn } from "../../../lib/utils";
import { useClinicsContext } from "../../../providers/ClinicsProvider";

interface ClinicCardProps {
  clinic: UserClinic;
}

export function ClinicCard({ clinic }: ClinicCardProps) {
  const { selectedId, openDetail } = useClinicsContext();
  const selected = selectedId === clinic.id;
  const { name, address, phone } = clinic.clinic;

  return (
    <button
      type="button"
      onClick={() => openDetail(clinic)}
      className={cn(
        "group w-full cursor-pointer rounded-2xl border border-border/80 bg-card p-4 text-left shadow-soft transition-[border-color,box-shadow,transform] duration-200",
        "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "border-primary ring-2 ring-primary/20",
      )}
    >
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          <Building2 className="h-5 w-5" aria-hidden />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="truncate font-semibold leading-tight tracking-tight">
              {name}
            </h3>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            {address && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="line-clamp-1">{address}</span>
              </span>
            )}
            {phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {phone}
              </span>
            )}
          </div>

          {clinic.notes && (
            <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <NotebookPen
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                aria-hidden
              />
              <span className="line-clamp-2">{clinic.notes}</span>
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export function ClinicDetail() {
  const { panel } = useClinicsContext();
  if (panel.kind !== "detail") return null;

  const clinic = panel.clinic;
  const { name, address, phone } = clinic.clinic;

  const rows = [
    address
      ? { icon: MapPin, label: "Address", value: address }
      : null,
    phone
      ? { icon: Phone, label: "Phone", value: phone }
      : null,
    clinic.notes
      ? { icon: NotebookPen, label: "Notes", value: clinic.notes }
      : null,
  ].filter(Boolean) as Array<{
    icon: typeof Building2;
    label: string;
    value: string;
  }>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Building2 className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold leading-tight">{name}</p>
          <p className="text-sm text-muted-foreground">Saved clinic</p>
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
