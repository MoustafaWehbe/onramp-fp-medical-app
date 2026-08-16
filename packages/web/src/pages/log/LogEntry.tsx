import {
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
import {AsidePanel} from "../../components/shared/AsidePanel";

import {
  useDailyEntriesContext,
} from "../../providers/DailyEntriesProvider";

import { DailyEntryForm } from "../../components/daily-entries/DailyEntryForm";
import { 
  getSymptomName,
  getMedicationName,
  getConditionName,
  getDoctorName, getClinicName, } from "../../lib/daily-entries/daily-entries-exports";
  import {getTodayDate} from "../../lib/daily-entries/form";

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

  const canEdit= selectedEntry && selectedEntry.entryDate === getTodayDate();

  if (
    formMode === "create" ||
    formMode === "edit"
  ) {
    return (
      <AsidePanel
      open={panelOpen}
      onClose={closePanel}
      title={panelTitle}
    >
      <DailyEntryForm />
    </AsidePanel>
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
      <AsidePanel
      open={panelOpen}
      onClose={closePanel}
      title={panelTitle}
      onEdit={canEdit ? () =>
        openEdit(selectedEntry)
      : undefined}
      onDelete={() =>
        selectedEntry && remove(selectedEntry.id)
      }
      deleteDisabled={isRemoving}
    >
        <div>
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
              id="daily-entry-panel-title"
              className="
                text-lg
                font-semibold
                text-foreground
              "
            >
                {panelTitle}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Daily health entry details
              </p>
            </div>
          </div>

          {/* -------------------------------- */}
          {/* Detail content                    */}
          {/* -------------------------------- */}

          <div className="overflow-y-auto p-6">
            {isDetailLoading ? (
              <div
                className="
                  flex
                  min-h-[300px]
                  items-center
                  justify-center
                "
              >
                <div className="text-sm text-muted-foreground">
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
                >{canEdit && (
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
                      text-foreground
                      transition
                      hover:bg-muted
                    "
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>)}

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
                    bg-muted
                    p-4
                  "
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays
                      className="
                        h-5
                        w-5
                        text-muted-foreground
                      "
                    />

                    <div>
                      <p
                        className="
                          text-xs
                          font-medium
                          uppercase
                          tracking-wide
                          text-muted-foreground
                        "
                      >
                        Entry date
                      </p>

                      <p
                        className="
                          mt-1
                          font-semibold
                          text-foreground
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
                        text-foreground
                      "
                    >
                      {selectedEntry.journalNotes}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground ">
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
                              bg-muted
                              p-3
                            "
                          >
                            <p className="font-medium text-foreground">
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
                                  text-muted-foreground
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
                <p className="text-sm text-muted-foreground">
                  No entry selected.
                </p>
              </div>
            )}
          </div>
        </div>
      </AsidePanel>
    );
  }

  return null;
}

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
       bg-card
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
        <div className="text-muted-foreground">
          {icon}
        </div>

        <div>
          <p
            className="
              text-xs
              font-medium
              uppercase
              tracking-wide
              text-muted-foreground
            "
          >
            {label}
          </p>

          <p
            className="
              mt-1
              font-semibold
              text-foreground
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
        bg-card
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
        <div className="text-muted-foreground">
          {icon}
        </div>

        <h3
          className="
            font-semibold
            text-foreground
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
            bg-muted
            px-3
            py-1
            text-sm
            text-foreground
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
    <p className="text-sm text-muted-foreground">
      None recorded.
    </p>
  );
}

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