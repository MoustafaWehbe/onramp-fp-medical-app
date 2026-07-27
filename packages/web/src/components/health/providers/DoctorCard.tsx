import {
  Building2,
  NotebookPen,
  Phone,
  Stethoscope,
} from "lucide-react";
import type { UserDoctor } from "../../../lib/health/health-export";
import { cn } from "../../../lib/utils";
import { useDoctorsContext } from "../../../providers/DoctorsProvider";

interface DoctorCardProps {
  doctor: UserDoctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const { selectedId, openDetail, savedClinics } = useDoctorsContext();
  const selected = selectedId === doctor.id;
  const { name, specialty, phone } = doctor.doctor;
  const linkedClinic = doctor.userClinic
    ? savedClinics.find((c) => c.id === doctor.userClinic!.id)
    : null;

  return (
    <button
      type="button"
      onClick={() => openDetail(doctor)}
      className={cn(
        "group w-full rounded-xl border bg-card p-4 text-left shadow-sm transition-all",
        "hover:border-primary/40 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "border-primary ring-2 ring-primary/20",
      )}
    >
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          <Stethoscope className="h-5 w-5" aria-hidden />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="truncate font-semibold leading-tight tracking-tight">
              {name}
            </h3>
            {specialty && (
              <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {specialty}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            {phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {phone}
              </span>
            )}
            {doctor.userClinic && (
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {linkedClinic?.clinic.name ?? "Linked to clinic"}
              </span>
            )}
          </div>

          {doctor.notes && (
            <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <NotebookPen
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                aria-hidden
              />
              <span className="line-clamp-2">{doctor.notes}</span>
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export function DoctorDetail() {
  const { panel, savedClinics } = useDoctorsContext();
  if (panel.kind !== "detail") return null;

  const doctor = panel.doctor;
  const { name, specialty, phone } = doctor.doctor;
  const linkedClinic = doctor.userClinic
    ? savedClinics.find((c) => c.id === doctor.userClinic!.id)
    : null;

  const rows = [
    specialty
      ? { icon: Stethoscope, label: "Specialty", value: specialty }
      : null,
    phone
      ? { icon: Phone, label: "Phone", value: phone }
      : null,
    linkedClinic
      ? {
          icon: Building2,
          label: "Clinic",
          value: linkedClinic.clinic.name,
        }
      : null,
    doctor.notes
      ? { icon: NotebookPen, label: "Notes", value: doctor.notes }
      : null,
  ].filter(Boolean) as Array<{
    icon: typeof Stethoscope;
    label: string;
    value: string;
  }>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Stethoscope className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold leading-tight">{name}</p>
          <p className="text-sm text-muted-foreground">Saved doctor</p>
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
