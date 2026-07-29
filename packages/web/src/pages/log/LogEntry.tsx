import type { ReactNode } from "react";
import {
  X,
  Pencil,
  Trash2,
  CalendarDays,
  HeartPulse,
  Moon,
  BookOpen,
  Activity,
  Pill,
  Stethoscope,
  Building2,
} from "lucide-react";

import {
  useDailyEntriesContext,
} from "../../providers/DailyEntriesProvider";

import { DailyEntryForm } from "../../components/daily-entries/DailyEntryForm";
import { 
  getSymptomName,
  getMedicationName,
  getConditionName,
  getDoctorName, getClinicName, } from "../../lib/daily-entries/daily-entries-exports";


export function LogEntry() {
  const {
    panel,
    panelOpen,
    panelTitle,

    selectedEntry,
    symptoms,
    medications,
    conditions,
    doctors,
    clinics,

    isDetailLoading,
    detailErrorMessage,

    formMode,

    closePanel,
    openEdit,

    remove,
    isRemoving,

    formError,
  } = useDailyEntriesContext();

  if (!panelOpen) {
    return null;
  }

  /**
   * ----------------------------------------------------
   * CREATE / EDIT
   * ----------------------------------------------------
   *
   * The actual form is handled by DailyEntryForm.
   */

  if (
    formMode === "create" ||
    formMode === "edit"
  ) {
    return (
      <div
        className="
          fixed
          inset-0
          z-50
          flex
          justify-end
          bg-black/40
        "
      >
        <div
          className="
            flex
            h-full
            w-full
            max-w-2xl
            flex-col
            bg-white
            shadow-xl
          "
        >
          {/* -------------------------------- */}
          {/* Panel header                       */}
          {/* -------------------------------- */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              px-6
              py-4
            "
          >
            <div>
              <h2
                className="
                  text-lg
                  font-semibold
                  text-gray-900
                "
              >
                {panelTitle}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {formMode === "create"
                  ? "Record your health information for today."
                  : "Update your daily health entry."}
              </p>
            </div>

            <button
              type="button"
              onClick={closePanel}
              aria-label="Close panel"
              className="
                rounded-md
                p-2
                text-gray-500
                transition
                hover:bg-gray-100
                hover:text-gray-700
              "
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* -------------------------------- */}
          {/* Form                              */}
          {/* -------------------------------- */}

          <div className="flex-1 overflow-y-auto p-6">
            <DailyEntryForm />
          </div>
        </div>
      </div>
    );
  }

  /**
   * ----------------------------------------------------
   * DETAIL
   * ----------------------------------------------------
   */

  if (
    panel.kind === "detail"
  ) {
    return (
      <div
        className="
          fixed
          inset-0
          z-50
          flex
          justify-end
          bg-black/40
        "
      >
        <div
          className="
            flex
            h-full
            w-full
            max-w-2xl
            flex-col
            bg-white
            shadow-xl
          "
        >
          {/* -------------------------------- */}
          {/* Header                            */}
          {/* -------------------------------- */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              px-6
              py-4
            "
          >
            <div>
              <h2
                className="
                  text-lg
                  font-semibold
                  text-gray-900
                "
              >
                {panelTitle}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Daily health entry details
              </p>
            </div>

            <button
              type="button"
              onClick={closePanel}
              aria-label="Close panel"
              className="
                rounded-md
                p-2
                text-gray-500
                transition
                hover:bg-gray-100
                hover:text-gray-700
              "
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* -------------------------------- */}
          {/* Detail content                    */}
          {/* -------------------------------- */}

          <div className="flex-1 overflow-y-auto">
            {isDetailLoading ? (
              <div
                className="
                  flex
                  min-h-[300px]
                  items-center
                  justify-center
                "
              >
                <div className="text-sm text-gray-500">
                  Loading entry details...
                </div>
              </div>
            ) : detailErrorMessage ? (
              <div className="p-6">
                <div
                  className="
                    rounded-lg
                    border
                    border-red-200
                    bg-red-50
                    p-4
                  "
                >
                  <p
                    className="
                      text-sm
                      font-medium
                      text-red-800
                    "
                  >
                    {detailErrorMessage}
                  </p>
                </div>
              </div>
            ) : selectedEntry ? (
              <div className="space-y-6 p-6">
                {/* -------------------------------- */}
                {/* Actions                            */}
                {/* -------------------------------- */}

                <div
                  className="
                    flex
                    justify-end
                    gap-2
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      openEdit(selectedEntry)
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
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
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={isRemoving}
                    onClick={() =>
                      remove(selectedEntry.id)
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-md
                      border
                      border-red-200
                      px-4
                      py-2
                      text-sm
                      font-medium
                      text-red-600
                      transition
                      hover:bg-red-50
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <Trash2 className="h-4 w-4" />

                    {isRemoving
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>

                {/* -------------------------------- */}
                {/* Delete error                      */}
                {/* -------------------------------- */}

                {formError && (
                  <div
                    className="
                      rounded-md
                      border
                      border-red-200
                      bg-red-50
                      p-3
                      text-sm
                      text-red-700
                    "
                  >
                    {formError}
                  </div>
                )}

                {/* -------------------------------- */}
                {/* Entry date                        */}
                {/* -------------------------------- */}

                <div
                  className="
                    rounded-lg
                    border
                    bg-gray-50
                    p-4
                  "
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays
                      className="
                        h-5
                        w-5
                        text-gray-500
                      "
                    />

                    <div>
                      <p
                        className="
                          text-xs
                          font-medium
                          uppercase
                          tracking-wide
                          text-gray-500
                        "
                      >
                        Entry date
                      </p>

                      <p
                        className="
                          mt-1
                          font-semibold
                          text-gray-900
                        "
                      >
                        {formatEntryDate(
                          selectedEntry.entryDate,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* -------------------------------- */}
                {/* Basic information                 */}
                {/* -------------------------------- */}

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                  "
                >
                  {/* Mood */}

                  <DetailItem
                    icon={
                      <HeartPulse className="h-5 w-5" />
                    }
                    label="Mood"
                    value={
                      selectedEntry.moodRating !== null
                        ? `${selectedEntry.moodRating} / 10`
                        : "Not recorded"
                    }
                  />

                  {/* Sleep */}

                  <DetailItem
                    icon={
                      <Moon className="h-5 w-5" />
                    }
                    label="Sleep"
                    value={
                      selectedEntry.sleepHours !== null
                        ? `${selectedEntry.sleepHours} hours`
                        : "Not recorded"
                    }
                  />
                </div>

                {/* -------------------------------- */}
                {/* Journal                           */}
                {/* -------------------------------- */}

                <DetailSection
                  icon={
                    <BookOpen className="h-5 w-5" />
                  }
                  title="Journal"
                >
                  {selectedEntry.journalNotes?.trim() ? (
                    <p
                      className="
                        whitespace-pre-wrap
                        text-sm
                        leading-6
                        text-gray-700
                      "
                    >
                      {selectedEntry.journalNotes}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No journal notes recorded.
                    </p>
                  )}
                </DetailSection>

                {/* -------------------------------- */}
                {/* Symptoms                          */}
                {/* -------------------------------- */}

                <DetailSection
                  icon={
                    <Activity className="h-5 w-5" />
                  }
                  title="Symptoms"
                >
                  {selectedEntry.symptoms.length > 0 ? (
                    <TagList
                      items={selectedEntry.symptoms.map(
                      (item) =>
                        getSymptomName(
                          item,
                          symptoms,
                        ),
                    )}
                    />
                  ) : (
                    <EmptyRelatedData />
                  )}
                </DetailSection>

                {/* -------------------------------- */}
                {/* Medications                       */}
                {/* -------------------------------- */}

                <DetailSection
                  icon={
                    <Pill className="h-5 w-5" />
                  }
                  title="Medications"
                >
                  {selectedEntry.medications.length > 0 ? (
                    <TagList
                      items={selectedEntry.medications.map(
                      (item) =>
                        getMedicationName(
                          item,
                          medications,
                        ),
                    )}
                    />
                  ) : (
                    <EmptyRelatedData />
                  )}
                </DetailSection>

                {/* -------------------------------- */}
                {/* Conditions                        */}
                {/* -------------------------------- */}

                <DetailSection
                  icon={
                    <HeartPulse className="h-5 w-5" />
                  }
                  title="Conditions"
                >
                  {selectedEntry.conditions.length > 0 ? (
                    <TagList
                      items={selectedEntry.conditions.map(
                      (item) =>
                        getConditionName(
                          item,
                          conditions,
                        ),
                    )}
                    />
                  ) : (
                    <EmptyRelatedData />
                  )}
                </DetailSection>

                {/* -------------------------------- */}
                {/* Doctor visits                     */}
                {/* -------------------------------- */}

                <DetailSection
                  icon={
                    <Stethoscope className="h-5 w-5" />
                  }
                  title="Doctor visits"
                >
                  {selectedEntry.doctorVisits.length > 0 ? (
                    <div className="space-y-3">
                      {selectedEntry.doctorVisits.map(
                        (visit) => (
                          <div
                            key={visit.id}
                            className="
                              rounded-md
                              border
                              bg-gray-50
                              p-3
                            "
                          >
                            <p className="font-medium text-gray-900">
                               {getDoctorName(
                                  visit,
                                  doctors,
                                )}
                            </p>

                            {getClinicName(visit, clinics) && (
                              <div
                                className="
                                  mt-1
                                  flex
                                  items-center
                                  gap-2
                                  text-sm
                                  text-gray-500
                                "
                              >
                                <Building2
                                  className="
                                    h-4
                                    w-4
                                  "
                                />

                                {getClinicName(visit, clinics)}
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <EmptyRelatedData />
                  )}
                </DetailSection>
              </div>
            ) : (
              <div className="p-6">
                <p className="text-sm text-gray-500">
                  No entry selected.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * ----------------------------------------------------
 * Helper components
 * ----------------------------------------------------
 */

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-lg
        border
        bg-white
        p-4
      "
    >
      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <div className="text-gray-500">
          {icon}
        </div>

        <div>
          <p
            className="
              text-xs
              font-medium
              uppercase
              tracking-wide
              text-gray-500
            "
          >
            {label}
          </p>

          <p
            className="
              mt-1
              font-semibold
              text-gray-900
            "
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="
        rounded-lg
        border
        bg-white
        p-4
      "
    >
      <div
        className="
          mb-4
          flex
          items-center
          gap-2
        "
      >
        <div className="text-gray-500">
          {icon}
        </div>

        <h3
          className="
            font-semibold
            text-gray-900
          "
        >
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}

function TagList({
  items,
}: {
  items: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="
            rounded-full
            bg-gray-100
            px-3
            py-1
            text-sm
            text-gray-700
          "
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function EmptyRelatedData() {
  return (
    <p className="text-sm text-gray-500">
      None recorded.
    </p>
  );
}

/**
 * ----------------------------------------------------
 * Date formatting
 * ----------------------------------------------------
 */

function formatEntryDate(
  entryDate: string,
): string {
  const date = new Date(
    `${entryDate}T00:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return entryDate;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}