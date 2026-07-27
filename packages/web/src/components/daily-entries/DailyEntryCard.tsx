import {
  CalendarDays,
  ClipboardList,
  FileText,
  Moon,
  Pill,
  Stethoscope,
  Thermometer,
} from "lucide-react";
import { Button } from "../ui/button";
import type { DailyEntry } from "../../lib/daily-entries/daily-entries-exports";
import { useDailyEntriesContext } from "../../providers/DailyEntriesProvider";

interface DailyEntryCardProps {
  entry: DailyEntry;
}

function formatEntryDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatMoodRating(moodRating: number | null): string {
  if (moodRating == null) {
    return "Not recorded";
  }

  return `${moodRating}/10`;
}

function formatSleepHours(sleepHours: number | null): string {
  if (sleepHours == null) {
    return "Not recorded";
  }

  return `${sleepHours} ${sleepHours === 1 ? "hour" : "hours"}`;
}

export function DailyEntryCard({ entry }: DailyEntryCardProps) {
  const { openDetail } = useDailyEntriesContext();

  return (
    <article className="flex h-full flex-col rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <CalendarDays className="h-5 w-5" aria-hidden />
            </div>

            <div className="min-w-0">
              <h3 className="truncate font-semibold">
                {formatEntryDate(entry.entryDate)}
              </h3>

              <p className="text-xs text-muted-foreground">
                Daily health entry
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => openDetail(entry)}
        >
          View
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ClipboardList className="h-4 w-4" aria-hidden />
            <span>Mood</span>
          </div>

          <p className="mt-1 font-medium">
            {formatMoodRating(entry.moodRating)}
          </p>
        </div>

        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Moon className="h-4 w-4" aria-hidden />
            <span>Sleep</span>
          </div>

          <p className="mt-1 font-medium">
            {formatSleepHours(entry.sleepHours)}
          </p>
        </div>
      </div>

      {entry.journalNotes && (
        <div className="mt-4 rounded-lg border bg-muted/20 p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <FileText className="h-4 w-4" aria-hidden />
            <span>Journal</span>
          </div>

          <p className="mt-2 line-clamp-3 text-sm text-foreground">
            {entry.journalNotes}
          </p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
          <Thermometer
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <span className="truncate">
            {entry.symptoms.length}{" "}
            {entry.symptoms.length === 1 ? "symptom" : "symptoms"}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
          <Pill
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <span className="truncate">
            {entry.medications.length}{" "}
            {entry.medications.length === 1 ? "medication" : "medications"}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
          <ClipboardList
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <span className="truncate">
            {entry.conditions.length}{" "}
            {entry.conditions.length === 1 ? "condition" : "conditions"}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
          <Stethoscope
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <span className="truncate">
            {entry.doctorVisits.length}{" "}
            {entry.doctorVisits.length === 1
              ? "doctor visit"
              : "doctor visits"}
          </span>
        </div>
      </div>

      <div className="mt-auto pt-5">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => openDetail(entry)}
        >
          View details
        </Button>
      </div>
    </article>
  );
}

export interface DailyEntryDetailProps {
  entry: DailyEntry;
}

export function DailyEntryDetail({ entry }: DailyEntryDetailProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Entry date</p>
        <p className="mt-1 font-medium">
          {formatEntryDate(entry.entryDate)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Mood</p>
          <p className="mt-1 font-medium">
            {formatMoodRating(entry.moodRating)}
          </p>
        </div>

        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Sleep</p>
          <p className="mt-1 font-medium">
            {formatSleepHours(entry.sleepHours)}
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Journal notes</p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
          {entry.journalNotes || "No journal notes recorded."}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Symptoms</h3>
          <span className="text-sm text-muted-foreground">
            {entry.symptoms.length}
          </span>
        </div>

        {entry.symptoms.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No symptoms recorded.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {entry.symptoms.map((symptom) => (
              <li key={symptom.id} className="rounded-lg border p-3">
                <p className="text-sm">
                  Severity: <strong>{symptom.severity}</strong>
                </p>

                {symptom.notes && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {symptom.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Medications</h3>
          <span className="text-sm text-muted-foreground">
            {entry.medications.length}
          </span>
        </div>

        {entry.medications.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No medications recorded.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {entry.medications.map((medication) => (
              <li key={medication.id} className="rounded-lg border p-3">
                <p className="text-sm">
                  Quantity:{" "}
                  <strong>
                    {medication.quantity} {medication.unit}
                  </strong>
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Status: {medication.taken ? "Taken" : "Not taken"}
                </p>

                {medication.notes && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {medication.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Conditions</h3>
          <span className="text-sm text-muted-foreground">
            {entry.conditions.length}
          </span>
        </div>

        {entry.conditions.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No conditions recorded.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {entry.conditions.map((condition) => (
              <li key={condition.id} className="rounded-lg border p-3">
                <p className="text-sm">
                  Status: <strong>{condition.status}</strong>
                </p>

                {condition.notes && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {condition.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Doctor visits</h3>
          <span className="text-sm text-muted-foreground">
            {entry.doctorVisits.length}
          </span>
        </div>

        {entry.doctorVisits.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No doctor visits recorded.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {entry.doctorVisits.map((visit) => (
              <li key={visit.id} className="rounded-lg border p-3">
                <p className="text-sm font-medium">{visit.summary}</p>

                {visit.notes && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {visit.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}