import type { ReactNode } from "react";
import {
  CalendarDays,
  HeartPulse,
  Moon,
  BookOpen,
  Activity,
  Pill,
  Stethoscope,
  Building2,
} from "lucide-react";
import { AsidePanel } from "../../components/shared/AsidePanel";
import { useDailyEntriesContext } from "../../providers/DailyEntriesProvider";
import { DailyEntryForm } from "../../components/daily-entries/DailyEntryForm";
import {
  getSymptomName,
  getMedicationName,
  getConditionName,
  getDoctorName,
  getClinicName,
  formatEntryDate,
} from "../../lib/daily-entries/daily-entries-exports";

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
    formError,
  } = useDailyEntriesContext();

  const isForm = formMode === "create" || formMode === "edit";

  return (
    <AsidePanel
      open={panelOpen}
      onClose={closePanel}
      title={panelTitle}
      className="max-w-lg"
      contentClassName={
        isForm
          ? "flex min-h-0 flex-1 flex-col overflow-hidden p-0"
          : undefined
      }
    >
      {isForm && <DailyEntryForm />}
      {panel.kind === "detail" && (
        isDetailLoading ? (
          <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
            Loading entry details...
          </div>
        ) : detailErrorMessage ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
          >
            {detailErrorMessage}
          </div>
        ) : selectedEntry ? (
          <div className="space-y-4">
            {formError && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {formError}
              </div>
            )}

            <div className="rounded-2xl border border-border/80 bg-muted/40 p-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-primary" aria-hidden />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Entry date
                  </p>
                  <p className="mt-1 font-semibold">
                    {formatEntryDate(selectedEntry.entryDate)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailItem
                icon={<HeartPulse className="h-5 w-5" aria-hidden />}
                label="Mood"
                value={
                  selectedEntry.moodRating !== null
                    ? `${selectedEntry.moodRating} / 5`
                    : "Not recorded"
                }
              />
              <DetailItem
                icon={<Moon className="h-5 w-5" aria-hidden />}
                label="Sleep"
                value={
                  selectedEntry.sleepHours !== null
                    ? `${selectedEntry.sleepHours} hours`
                    : "Not recorded"
                }
              />
            </div>

            <DetailSection
              icon={<BookOpen className="h-5 w-5" aria-hidden />}
              title="Journal"
            >
              {selectedEntry.journalNotes?.trim() ? (
                <p className="whitespace-pre-wrap text-sm leading-6">
                  {selectedEntry.journalNotes}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No journal notes recorded.
                </p>
              )}
            </DetailSection>

            <DetailSection
              icon={<Activity className="h-5 w-5" aria-hidden />}
              title="Symptoms"
            >
              {selectedEntry.symptoms.length > 0 ? (
                <TagList
                  items={selectedEntry.symptoms.map((item) =>
                    getSymptomName(item, symptoms),
                  )}
                />
              ) : (
                <EmptyRelatedData />
              )}
            </DetailSection>

            <DetailSection
              icon={<Pill className="h-5 w-5" aria-hidden />}
              title="Medications"
            >
              {selectedEntry.medications.length > 0 ? (
                <TagList
                  items={selectedEntry.medications.map((item) =>
                    getMedicationName(item, medications),
                  )}
                />
              ) : (
                <EmptyRelatedData />
              )}
            </DetailSection>

            <DetailSection
              icon={<HeartPulse className="h-5 w-5" aria-hidden />}
              title="Conditions"
            >
              {selectedEntry.conditions.length > 0 ? (
                <TagList
                  items={selectedEntry.conditions.map((item) =>
                    getConditionName(item, conditions),
                  )}
                />
              ) : (
                <EmptyRelatedData />
              )}
            </DetailSection>

            <DetailSection
              icon={<Stethoscope className="h-5 w-5" aria-hidden />}
              title="Doctor visits"
            >
              {selectedEntry.doctorVisits.length > 0 ? (
                <div className="space-y-3">
                  {selectedEntry.doctorVisits.map((visit) => (
                    <div
                      key={visit.id}
                      className="rounded-xl border bg-muted/50 p-3"
                    >
                      <p className="font-medium">
                        {getDoctorName(visit, doctors)}
                      </p>
                      {getClinicName(visit, clinics) && (
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-4 w-4" aria-hidden />
                          {getClinicName(visit, clinics)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyRelatedData />
              )}
            </DetailSection>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No entry selected.</p>
        )
      )}
    </AsidePanel>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="text-primary">{icon}</div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 font-semibold">{value}</p>
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
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <div className="text-primary">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function EmptyRelatedData() {
  return <p className="text-sm text-muted-foreground">None recorded.</p>;
}
