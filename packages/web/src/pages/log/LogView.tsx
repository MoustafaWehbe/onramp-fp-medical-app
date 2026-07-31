import { LogEntry } from "./LogEntry";
import {
  ClipboardList,
  ClipboardPenLine,
} from "lucide-react";

import {
  LoadingSpinner,
} from "../../components/shared/LoadingSpinner";

import {
  Pagination,
  paginationFromApi,
} from "../../components/shared/Pagination";

import { DailyEntryCard } from "../../components/daily-entries/DailyEntryCard";

import {
  useDailyEntriesContext,
} from "../../providers/DailyEntriesProvider";

export function LogView() {
  const {
    entries,

    isLoading,
    isError,
    listErrorMessage,

    isInvalidDateRange,
    pagination,

    currentPage,
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


  /**
   * ----------------------------------------------------
   * Loading state
   * ----------------------------------------------------
   */

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  /**
   * ----------------------------------------------------
   * Error state
   * ----------------------------------------------------
   */

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-800">
          Unable to load daily entries
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {listErrorMessage ??
            "Something went wrong while loading your daily entries."}
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* -------------------------------- */}
      {/* Page header                       */}
      {/* -------------------------------- */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-lg
                bg-primary/10
                text-primary
              "
            >
              <ClipboardList className="h-5 w-5" />
            </div>

            <div>
              <h1
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  text-gray-900
                "
              >
                Daily Entries
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                View your daily health history.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-md
            bg-primary
            px-4
            py-2
            text-sm
            font-medium
            text-primary-foreground
            transition
            hover:bg-primary/90
          "
        >
          <ClipboardPenLine className="h-4 w-4" />
          Add Daily Entry
        </button>
      </div>

      {/* -------------------------------- */}
      {/* Date filters                      */}
      {/* -------------------------------- */}

      <div
        className="
          rounded-lg
          border
          bg-white
          p-4
          shadow-sm
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-end
          "
        >
          <div className="flex-1">
            <label
              htmlFor="from-date"
              className="
                mb-1
                block
                text-sm
                font-medium
                text-gray-700
              "
            >
              From date
            </label>

            <input
              id="from-date"
              type="date"
              value={fromDate ?? ""}
              onChange={(event) =>
                setFromDate(
                  event.target.value || undefined,
                )
              }
              className="
                w-full
                rounded-md
                border
                px-3
                py-2
                text-sm
                outline-none
                focus:ring-2
                focus:ring-primary/30
              "
            />
          </div>

          <div className="flex-1">
            <label
              htmlFor="to-date"
              className="
                mb-1
                block
                text-sm
                font-medium
                text-gray-700
              "
            >
              To date
            </label>

            <input
              id="to-date"
              type="date"
              value={toDate ?? ""}
              onChange={(event) =>
                setToDate(
                  event.target.value || undefined,
                )
              }
              className="
                w-full
                rounded-md
                border
                px-3
                py-2
                text-sm
                outline-none
                focus:ring-2
                focus:ring-primary/30
              "
            />
          </div>

          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={clearDateFilters}
              className="
                rounded-md
                border
                px-4
                py-2
                text-sm
                font-medium
                text-gray-700
                transition
                hover:bg-gray-50
              "
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
      {/* -------------------------------- */}
      {/* Date range validation             */}
      {/* -------------------------------- */}

      {isInvalidDateRange && (
        <div
          className="
            rounded-lg
            border
            border-amber-200
            bg-amber-50
            p-4
          "
        >
          <h2 className="text-sm font-semibold text-amber-800">
            Invalid date range
          </h2>

          <p className="mt-1 text-sm text-amber-700">
            The "From date" cannot be later than the "To date".
            Please select a valid date range.
          </p>
        </div>
      )}

      {/* -------------------------------- */}
      {/* Empty state                       */}
      {/* -------------------------------- */}

      {entries.length === 0 ? (
        <div
          className="
            rounded-lg
            border
            border-dashed
            bg-white
            px-6
            py-12
            text-center
          "
        >
          <ClipboardList
            className="
              mx-auto
              h-12
              w-12
              text-gray-400
            "
          />

          <h2
            className="
              mt-4
              text-lg
              font-semibold
              text-gray-900
            "
          >
            No daily entries found
          </h2>

          <p
            className="
              mx-auto
              mt-2
              max-w-md
              text-sm
              text-gray-500
            "
          >
            {fromDate || toDate
              ? "No entries match the selected date range."
              : "You have not created any daily entries yet."}
          </p>

          {!fromDate && !toDate && (
            <button
              type="button"
              onClick={openCreate}
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-md
                bg-primary
                px-4
                py-2
                text-sm
                font-medium
                text-primary-foreground
                transition
                hover:bg-primary/90
              "
            >
              <ClipboardPenLine className="h-4 w-4" />
              Create your first entry
            </button>
          )}
        </div>
      ) : (
        <>
          {/* -------------------------------- */}
          {/* Entries list                      */}
          {/* -------------------------------- */}

          <div className="space-y-4">
            {entries.map((entry) => (
              <DailyEntryCard
                key={entry.id}
                entry={entry}
                onClick={() => openDetail(entry)}
              />
            ))}
          </div>

          {/* -------------------------------- */}
          {/* Pagination                        */}
          {/* -------------------------------- */}

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
