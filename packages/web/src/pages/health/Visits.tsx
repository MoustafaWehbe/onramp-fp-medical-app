import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

function visitDayLabel(isoDate: string, locale: string, todayLabel: string, yesterdayLabel: string): string {
  const visitDay = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(visitDay.getTime())) return isoDate;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const that = new Date(visitDay);
  that.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (today.getTime() - that.getTime()) / 86_400_000,
  );

  if (diffDays === 0) return todayLabel;
  if (diffDays === 1) return yesterdayLabel;
  return visitDay.toLocaleDateString(locale, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function groupVisitsByDate(
  visits: EntryDoctorVisit[],
  locale: string,
  todayLabel: string,
  yesterdayLabel: string,
) {
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
        label: visitDayLabel(date, locale, todayLabel, yesterdayLabel),
        visits: [visit],
      });
    }
  }

  return groups;
}

export function DoctorVisitsPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ar" ? "ar-EG" : "en-US";
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

  const todayLabel = t("doctorVisits.today");
  const yesterdayLabel = t("doctorVisits.yesterday");
  const groupedVisits = useMemo(
    () => groupVisitsByDate(doctorVisits, locale, todayLabel, yesterdayLabel),
    [doctorVisits, locale, todayLabel, yesterdayLabel],
  );

  useEffect(() => {
    setSelectedVisit(null);
  }, [currentPage]);

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow={t("doctorVisits.eyebrow")}
        title={t("doctorVisits.title")}
        description={t("doctorVisits.description")}
        icon={CalendarDays}
        badge={
          !isLoading && totalCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-secondary/80 px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
              <ClipboardList className="h-3.5 w-3.5" aria-hidden />
              {totalCount} {t("doctorVisits.count", { count: totalCount })}
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
            {t("doctorVisits.logVisit")}
          </Button>
        )}
      />

      {isError && (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center shadow-soft"
        >
          <p className="text-sm text-destructive">
            {error?.message ?? t("doctorVisits.failedLoad")}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => refetch()}
          >
            {t("doctorVisits.tryAgain")}
          </Button>
        </div>
      )}

      {!isError && (
        <SectionPanel
          title={t("doctorVisits.historyTitle")}
          description={t("doctorVisits.historyDescription")}
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
              <p className="font-medium">{t("doctorVisits.noVisits")}</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {t("doctorVisits.noVisitsDescription")}
              </p>
              <Button
                type="button"
                className="mt-4"
                onClick={() => navigate("/log/view")}
              >
                <ClipboardPenLine className="mr-1.5 h-4 w-4" aria-hidden />
                {t("doctorVisits.addDailyEntry")}
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
                    {(group.label === todayLabel || group.label === yesterdayLabel) && (
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        {formatDate(`${group.date}T00:00:00`, locale)}
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
        title={t("doctorVisits.detailsTitle")}
      >
        {selectedVisit && <DoctorVisitDetail visit={selectedVisit} />}
      </AsidePanel>
    </div>
  );
}
