import {
  Building2,
  Eye,
  NotebookPen,
  Pencil,
  Phone,
  Stethoscope,
  Trash2,
} from "lucide-react";
import type { UserDoctor } from "../../../lib/health/health-export";
import { cn } from "../../../lib/utils";
import { useDoctorsContext } from "../../../providers/DoctorsProvider";
import { RowActionsMenu } from "../../shared/RowActionsMenu";

interface DoctorCardProps {
  doctor: UserDoctor;
  onDelete: () => void;
}

export function DoctorCard({ doctor, onDelete }: DoctorCardProps) {
  const { selectedId, openDetail, openEdit, savedClinics } = useDoctorsContext();
  const selected = selectedId === doctor.id;
  const { name, specialty, phone } = doctor.doctor;
  const linkedClinic = doctor.userClinic
    ? savedClinics.find((c) => c.id === doctor.userClinic!.id)
    : null;

  return (
    <article
      className={cn(
        "group flex items-start gap-1 rounded-2xl border border-border/80 bg-card p-2 pl-4 shadow-soft transition-[border-color,box-shadow,transform] duration-200",
        "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift",
        selected && "border-primary ring-2 ring-primary/20",
      )}
    >
      <button
        type="button"
        onClick={() => openDetail(doctor)}
        aria-label={`View ${name}`}
        className="flex min-w-0 flex-1 cursor-pointer gap-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
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
            {linkedClinic && (
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {linkedClinic.clinic.name}
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
      </button>

      <RowActionsMenu
        label={`Actions for ${name}`}
        actions={[
          {
            id: "view",
            label: "View",
            icon: Eye,
            onSelect: () => openDetail(doctor),
          },
          {
            id: "edit",
            label: "Edit",
            icon: Pencil,
            onSelect: () => openEdit(doctor),
          },
          {
            id: "delete",
            label: "Delete",
            icon: Trash2,
            variant: "destructive",
            onSelect: onDelete,
          },
        ]}
      />
    </article>
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
