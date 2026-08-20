import {
  Building2,
  CalendarDays,
  ClipboardList,
  Eye,
  MapPin,
  NotebookPen,
  Stethoscope,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { EntryDoctorVisit } from "../../lib/doctor-visit-entries/doctor-visit-exports";
import { cn, formatDate } from "../../lib/utils";
import { RowActionsMenu } from "../shared/RowActionsMenu";

interface DoctorVisitCardProps {
  visit: EntryDoctorVisit;
  selected?: boolean;
  onView: () => void;
}

function visitDoctorName(visit: EntryDoctorVisit, fallback: string): string {
  return visit.userDoctor?.doctor?.name ?? fallback;
}

export function DoctorVisitCard({
  visit,
  selected = false,
  onView,
}: DoctorVisitCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const doctorName = visitDoctorName(visit, t("doctorVisits.unknownDoctor"));
  const specialty = visit.userDoctor?.doctor?.specialty;
  const clinic = visit.userClinic?.clinic;

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
        onClick={onView}
        aria-label={t("doctorVisits.viewVisitWith", { doctor: doctorName })}
        className="flex min-w-0 flex-1 cursor-pointer gap-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          <Stethoscope className="h-5 w-5" aria-hidden />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="truncate font-semibold leading-tight tracking-tight">
              {doctorName}
            </h3>
            {specialty && (
              <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {specialty}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            {clinic && (
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {clinic.name}
              </span>
            )}
            {clinic?.address && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="line-clamp-1">{clinic.address}</span>
              </span>
            )}
          </div>

          {visit.summary && (
            <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <NotebookPen
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                aria-hidden
              />
              <span className="line-clamp-2">{visit.summary}</span>
            </p>
          )}
        </div>
      </button>

      <RowActionsMenu
        label={t("doctorVisits.actionsForVisit", { doctor: doctorName })}
        actions={[
          {
            id: "view",
            label: t("doctorVisits.view"),
            icon: Eye,
            onSelect: onView,
          },
          {
            id: "open-log",
            label: t("doctorVisits.openDailyLog"),
            icon: ClipboardList,
            onSelect: () => navigate("/log/view"),
          },
        ]}
      />
    </article>
  );
}

export function DoctorVisitDetail({ visit }: { visit: EntryDoctorVisit }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ar" ? "ar-EG" : "en-US";
  const doctorName = visitDoctorName(visit, t("doctorVisits.unknownDoctor"));
  const specialty = visit.userDoctor?.doctor?.specialty;
  const clinic = visit.userClinic?.clinic;

  const rows = [
    specialty
      ? { icon: Stethoscope, label: t("doctorVisits.specialty"), value: specialty }
      : null,
    visit.entry.entryDate
      ? {
          icon: CalendarDays,
          label: t("doctorVisits.visitDate"),
          value: formatDate(`${visit.entry.entryDate}T00:00:00`, locale),
        }
      : null,
    clinic
      ? { icon: Building2, label: t("doctorVisits.clinic"), value: clinic.name }
      : null,
    clinic?.address
      ? { icon: MapPin, label: t("doctorVisits.address"), value: clinic.address }
      : null,
    visit.summary
      ? { icon: NotebookPen, label: t("doctorVisits.summary"), value: visit.summary }
      : null,
    visit.notes
      ? { icon: NotebookPen, label: t("doctorVisits.notes"), value: visit.notes }
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
          <p className="truncate text-lg font-semibold leading-tight">
            {doctorName}
          </p>
          <p className="text-sm text-muted-foreground">{t("doctorVisits.recordedVisit")}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("doctorVisits.noAdditionalDetails")}
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

      <button
        type="button"
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-input bg-card px-4 text-sm font-semibold shadow-sm transition-colors hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => navigate("/log/view")}
      >
        <ClipboardList className="h-4 w-4" aria-hidden />
        {t("doctorVisits.openDailyLog")}
      </button>
    </div>
  );
}
