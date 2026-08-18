import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  ClipboardPenLine,
} from "lucide-react";
import {
  DoctorVisitCard,
  DoctorVisitDetail,
} from "../../components/doctor-visits/DoctorVisitCard";
import { AsidePanel } from "../../components/shared/AsidePanel";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import { Pagination } from "../../components/shared/Pagination";
import { PageHeader } from "../../components/shared/PageHeader";
import { SectionPanel } from "../../components/shared/SectionPanel";
import { Button } from "../../components/ui/button";
import type { EntryDoctorVisit } from "../../lib/doctor-visit-entries/doctor-visit-exports";
import { formatDate } from "../../lib/utils";
import { useDoctorVisitsContext } from "../../providers/DoctorVisitsProvider";

function visitDayLabel(isoDate: string): string {
  const visitDay = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(visitDay.getTime())) return isoDate;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const that = new Date(visitDay);
  that.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (today.getTime() - that.getTime()) / 86_400_000,
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return visitDay.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function groupVisitsByDate(visits: EntryDoctorVisit[]) {
  const groups: { date: string; label: string; visits: EntryDoctorVisit[] }[] =
    [];

  for (const visit of visits) {
    const date = visit.entry.entryDate;
    const last = groups[groups.length - 1];
    if (last && last.date === date) {
      last.visits.push(visit);
    } else {
      groups.push({
        date,
        label: visitDayLabel(date),
        visits: [visit],
      });
    }
  }

  return groups;
}

export function DoctorVisitsPage() {
  const navigate = useNavigate();
  const {
    doctorVisits,
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    isLoading,
    isFetching,
    isError,
    error,
    setCurrentPage,
    refetch,
  } = useDoctorVisitsContext();
  const [selectedVisit, setSelectedVisit] = useState<EntryDoctorVisit | null>(
    null,
  );

  const groupedVisits = useMemo(
    () => groupVisitsByDate(doctorVisits),
    [doctorVisits],
  );

  useEffect(() => {
    setSelectedVisit(null);
  }, [currentPage]);

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Appointments"
        title="Doctor Visits"
        description="A timeline of clinic visits recorded in your daily logs."
        icon={CalendarDays}
        badge={
          !isLoading && totalCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-secondary/80 px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
              <ClipboardList className="h-3.5 w-3.5" aria-hidden />
              {totalCount} {totalCount === 1 ? "visit" : "visits"}
            </span>
          ) : undefined
        }
        action={(
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => navigate("/log/view")}
          >
            <ClipboardPenLine className="mr-1.5 h-4 w-4" aria-hidden />
            Log a visit
          </Button>
        )}
      />

      {isError && (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center shadow-soft"
        >
          <p className="text-sm text-destructive">
            {error?.message ?? "Failed to load doctor visits."}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => refetch()}
          >
            Try again
          </Button>
        </div>
      )}

      {!isError && (
        <SectionPanel
          title="Visit history"
          description="Select a visit to review doctor, clinic, and notes."
          icon={CalendarDays}
        >
          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : doctorVisits.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <CalendarDays className="h-6 w-6" aria-hidden />
              </div>
              <p className="font-medium">No doctor visits yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Record a visit when you log a daily entry. It will show up here
                by date.
              </p>
              <Button
                type="button"
                className="mt-4"
                onClick={() => navigate("/log/view")}
              >
                <ClipboardPenLine className="mr-1.5 h-4 w-4" aria-hidden />
                Add a daily entry
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedVisits.map((group) => (
                <section key={group.date} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <time
                      dateTime={group.date}
                      className="text-sm font-semibold tracking-tight"
                    >
                      {group.label}
                    </time>
                    {(group.label === "Today" || group.label === "Yesterday") && (
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        {formatDate(`${group.date}T00:00:00`)}
                      </span>
                    )}
                    <span
                      className="h-px min-w-4 flex-1 bg-border"
                      aria-hidden
                    />
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium tabular-nums text-secondary-foreground">
                      {group.visits.length}
                    </span>
                  </div>

                  <ul className="grid grid-cols-1 gap-3">
                    {group.visits.map((visit) => (
                      <li key={visit.id}>
                        <DoctorVisitCard
                          visit={visit}
                          selected={selectedVisit?.id === visit.id}
                          onView={() => setSelectedVisit(visit)}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                disabled={isFetching}
              />
            </div>
          )}
        </SectionPanel>
      )}

      <AsidePanel
        open={selectedVisit != null}
        onClose={() => setSelectedVisit(null)}
        title="Visit details"
      >
        {selectedVisit && <DoctorVisitDetail visit={selectedVisit} />}
      </AsidePanel>
    </div>
  );
}
