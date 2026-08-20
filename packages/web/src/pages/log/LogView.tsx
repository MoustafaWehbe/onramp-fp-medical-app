import { ClipboardList, ClipboardPenLine } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import {
  Pagination,
  paginationFromApi,
} from "../../components/shared/Pagination";
import { DailyEntryCard } from "../../components/daily-entries/DailyEntryCard";
import { useDailyEntriesContext } from "../../providers/DailyEntriesProvider";
import type { DailyEntry } from "../../lib/daily-entries/daily-entries-exports";
import { formatEntryDate } from "../../lib/daily-entries/daily-entries-exports";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { PageHeader } from "../../components/shared/PageHeader";
import { SectionPanel } from "../../components/shared/SectionPanel";
import { LogEntry } from "./LogEntry";

export function LogView() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ar" ? "ar-EG" : "en-US";
  const {
    entries,
    isLoading,
    isError,
    listErrorMessage,
    isInvalidDateRange,
    pagination,
    pageSize,
    goToPage,
    goToNextPage,
    goToPrevPage,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    clearDateFilters,
    openCreate,
    remove,
    isRemoving,
    formError,
  } = useDailyEntriesContext();
  const [pendingDelete, setPendingDelete] = useState<DailyEntry | null>(null);

  async function confirmDelete() {
    if (!pendingDelete) return;
    await remove(pendingDelete.id);
    setPendingDelete(null);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-shell">
        <div
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 shadow-soft"
        >
          <h2 className="text-lg font-semibold text-destructive">
            {t("dailyEntries.page.unableLoad")}
          </h2>
          <p className="mt-2 text-sm text-destructive/90">
            {listErrorMessage ?? t("dailyEntries.page.unableLoadDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="page-shell">
      <PageHeader
        eyebrow={t("dailyEntries.page.dailyCheckIn")}
        title={t("dailyEntries.page.dailyEntries")}
        description={t("dailyEntries.page.historyDescription")}
        icon={ClipboardList}
        action={(
          <Button type="button" className="w-full sm:w-auto" onClick={openCreate}>
            <ClipboardPenLine className="mr-1.5 h-4 w-4" aria-hidden />
            {t("dailyEntries.page.addEntry")}
          </Button>
        )}
      />

      <SectionPanel
        title={t("dailyEntries.page.dateRange")}
        description={t("dailyEntries.page.dateRangeDescription")}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="from-date" className="mb-1.5 block text-sm font-semibold">
              {t("dailyEntries.page.fromDate")}
            </label>
            <Input
              id="from-date"
              type="date"
              value={fromDate ?? ""}
              onChange={(event) => setFromDate(event.target.value || undefined)}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="to-date" className="mb-1.5 block text-sm font-semibold">
              {t("dailyEntries.page.toDate")}
            </label>
            <Input
              id="to-date"
              type="date"
              value={toDate ?? ""}
              onChange={(event) => setToDate(event.target.value || undefined)}
            />
          </div>
          {(fromDate || toDate) && (
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={clearDateFilters}>
              {t("dailyEntries.page.clearFilters")}
            </Button>
          )}
        </div>
      </SectionPanel>

      {isInvalidDateRange && (
        <div
          role="alert"
          className="rounded-2xl border border-warning/30 bg-warning/10 p-4"
        >
          <h2 className="text-sm font-semibold text-warning-foreground">
            {t("dailyEntries.page.invalidRange")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("dailyEntries.page.invalidRangeDescription")}
          </p>
        </div>
      )}

      <SectionPanel
        title={t("dailyEntries.page.historyTitle")}
        description={t("dailyEntries.page.historySubtitle")}
        icon={ClipboardList}
      >
        {formError && (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
          >
            {formError}
          </p>
        )}

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ClipboardList className="h-6 w-6" aria-hidden />
            </div>
            <p className="font-medium">{t("dailyEntries.page.noEntriesFound")}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {fromDate || toDate
                ? t("dailyEntries.page.noEntriesMatchRange")
                : t("dailyEntries.page.noEntriesYet")}
            </p>
            {!fromDate && !toDate && (
              <Button type="button" className="mt-4" onClick={openCreate}>
                <ClipboardPenLine className="mr-1.5 h-4 w-4" aria-hidden />
                {t("dailyEntries.page.createFirstEntry")}
              </Button>
            )}
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-3">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <DailyEntryCard
                    entry={entry}
                    onDelete={() => setPendingDelete(entry)}
                  />
                </li>
              ))}
            </ul>
            {pagination && (
              <div className="mt-5">
                <Pagination
                  {...paginationFromApi(pagination)}
                  onNext={goToNextPage}
                  onPrev={goToPrevPage}
                  onPageChange={goToPage}
                  pageSize={pageSize}
                />
              </div>
            )}
          </>
        )}
      </SectionPanel>

      <LogEntry />

      <ConfirmDialog
        open={pendingDelete != null}
        onOpenChange={(open) => {
          if (!open && !isRemoving) setPendingDelete(null);
        }}
        title={
          pendingDelete
            ? t("dailyEntries.page.deleteTitle", { date: formatEntryDate(pendingDelete.entryDate, locale) })
            : t("dailyEntries.page.deleteEntry")
        }
        description={t("dailyEntries.page.deleteDescription")}
        confirmLabel={t("dailyEntries.page.deleteEntry")}
        loading={isRemoving}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
