import { ClipboardList, ClipboardPenLine } from "lucide-react";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import {
  Pagination,
  paginationFromApi,
} from "../../components/shared/Pagination";
import { DailyEntryCard } from "../../components/daily-entries/DailyEntryCard";
import { useDailyEntriesContext } from "../../providers/DailyEntriesProvider";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { PageHeader } from "../../components/shared/PageHeader";
import { SectionPanel } from "../../components/shared/SectionPanel";
import { LogEntry } from "./LogEntry";

export function LogView() {
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
    openDetail,
    openCreate,
  } = useDailyEntriesContext();

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
            Unable to load daily entries
          </h2>
          <p className="mt-2 text-sm text-destructive/90">
            {listErrorMessage ??
              "Something went wrong while loading your daily entries."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="page-shell">
      <PageHeader
        eyebrow="Daily check-in"
        title="Daily Entries"
        description="View your daily health history."
        icon={ClipboardList}
        action={(
          <Button type="button" className="w-full sm:w-auto" onClick={openCreate}>
            <ClipboardPenLine className="mr-1.5 h-4 w-4" aria-hidden />
            Add Daily Entry
          </Button>
        )}
      />

      <SectionPanel
        title="Date range"
        description="Filter check-ins by when you logged them."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="from-date" className="mb-1.5 block text-sm font-semibold">
              From date
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
              To date
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
              Clear filters
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
            Invalid date range
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The "From date" cannot be later than the "To date". Please select a
            valid date range.
          </p>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card px-6 py-16 text-center shadow-soft">
          <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">No daily entries found</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {fromDate || toDate
              ? "No entries match the selected date range."
              : "You have not created any daily entries yet."}
          </p>
          {!fromDate && !toDate && (
            <Button type="button" className="mt-5" onClick={openCreate}>
              <ClipboardPenLine className="mr-1.5 h-4 w-4" aria-hidden />
              Create your first entry
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {entries.map((entry) => (
              <DailyEntryCard
                key={entry.id}
                entry={entry}
                onClick={() => openDetail(entry)}
              />
            ))}
          </div>
          {pagination && (
            <Pagination
              {...paginationFromApi(pagination)}
              onNext={goToNextPage}
              onPrev={goToPrevPage}
              onPageChange={goToPage}
              pageSize={pageSize}
            />
          )}
        </>
      )}
      <LogEntry />
    </section>
  );
}
