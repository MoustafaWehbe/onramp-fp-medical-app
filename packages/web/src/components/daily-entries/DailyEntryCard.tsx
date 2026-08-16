import {
  ClipboardList,
  Eye,
  HeartPulse,
  Moon,
  NotebookPen,
  Pencil,
  Trash2,
} from "lucide-react";
import type { DailyEntry } from "../../lib/daily-entries/daily-entries-exports";
import { getTodayDate } from "../../lib/daily-entries/form";
import { cn } from "../../lib/utils";
import { useDailyEntriesContext } from "../../providers/DailyEntriesProvider";
import { RowActionsMenu } from "../shared/RowActionsMenu";

interface DailyEntryCardProps {
  entry: DailyEntry;
  onDelete: () => void;
}

function formatEntryDate(entryDate: string): string {
  const date = new Date(`${entryDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return entryDate;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function DailyEntryCard({ entry, onDelete }: DailyEntryCardProps) {
  const { selectedId, openDetail, openEdit } = useDailyEntriesContext();
  const selected = selectedId === entry.id;
  const canEdit = entry.entryDate === getTodayDate();
  const journal = entry.journalNotes?.trim() || null;
  const dateLabel = formatEntryDate(entry.entryDate);

  const summaryParts = [
    entry.symptoms.length > 0
      ? `${entry.symptoms.length} ${entry.symptoms.length === 1 ? "symptom" : "symptoms"}`
      : null,
    entry.medications.length > 0
      ? `${entry.medications.length} ${entry.medications.length === 1 ? "medication" : "medications"}`
      : null,
    entry.conditions.length > 0
      ? `${entry.conditions.length} ${entry.conditions.length === 1 ? "condition" : "conditions"}`
      : null,
    entry.doctorVisits.length > 0
      ? `${entry.doctorVisits.length} ${entry.doctorVisits.length === 1 ? "visit" : "visits"}`
      : null,
  ].filter(Boolean) as string[];

  function viewEntry() {
    openDetail(entry);
  }

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
        onClick={viewEntry}
        aria-label={`View daily entry for ${dateLabel}`}
        className="flex min-w-0 flex-1 cursor-pointer gap-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          <ClipboardList className="h-5 w-5" aria-hidden />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="truncate font-semibold leading-tight tracking-tight">
              {dateLabel}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5">
              {entry.moodRating != null && (
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  <HeartPulse className="h-3 w-3" aria-hidden />
                  Mood {entry.moodRating}/5
                </span>
              )}
              {entry.sleepHours != null && (
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  <Moon className="h-3 w-3" aria-hidden />
                  {entry.sleepHours}h sleep
                </span>
              )}
            </div>
          </div>

          {summaryParts.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {summaryParts.join(" · ")}
            </p>
          )}

          {journal && (
            <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <NotebookPen className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="line-clamp-2">{journal}</span>
            </p>
          )}
        </div>
      </button>

      <RowActionsMenu
        label={`Actions for ${dateLabel}`}
        actions={[
          {
            id: "view",
            label: "View",
            icon: Eye,
            onSelect: viewEntry,
          },
          ...(canEdit
            ? [
                {
                  id: "edit",
                  label: "Edit",
                  icon: Pencil,
                  onSelect: () => openEdit(entry),
                },
              ]
            : []),
          {
            id: "delete",
            label: "Delete",
            icon: Trash2,
            variant: "destructive" as const,
            onSelect: onDelete,
          },
        ]}
      />
    </article>
  );
}
