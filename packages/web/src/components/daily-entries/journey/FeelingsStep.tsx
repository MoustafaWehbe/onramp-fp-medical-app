import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import type { DailyEntryFormValues } from "../../../lib/daily-entries/daily-entries-exports";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { cn } from "../../../lib/utils";
import { textareaFieldClass } from "./fieldStyles";

const MOOD_OPTIONS = [
  { value: "1", label: "Low" },
  { value: "2", label: "Off" },
  { value: "3", label: "Okay" },
  { value: "4", label: "Good" },
  { value: "5", label: "Great" },
] as const;

interface FeelingsStepProps {
  control: Control<DailyEntryFormValues>;
  register: UseFormRegister<DailyEntryFormValues>;
  formErrors: FieldErrors<DailyEntryFormValues>;
}

function nextSleepHours(currentValue: string | undefined, delta: number): string {
  const parsed = Number(currentValue);
  const current = currentValue && !Number.isNaN(parsed) ? parsed : 0;
  const next = Math.min(24, Math.max(0, Math.round((current + delta) * 2) / 2));
  return String(next);
}

export function FeelingsStep({
  control,
  register,
  formErrors,
}: FeelingsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="entryDate">Entry date</Label>
        <Input id="entryDate" type="date" readOnly className="mt-1.5" {...register("entryDate")} />
        {formErrors.entryDate && (
          <p className="mt-1.5 text-sm text-destructive">{formErrors.entryDate.message}</p>
        )}
      </div>

      <Controller
        name="moodRating"
        control={control}
        render={({ field }) => (
          <div>
            <p id="mood-label" className="text-sm font-semibold">
              Mood rating
            </p>
            <div className="mt-2.5 grid grid-cols-5 gap-1.5" role="group" aria-labelledby="mood-label">
              {MOOD_OPTIONS.map((option) => {
                const selected = field.value === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => field.onChange(option.value)}
                    className={cn(
                      "flex min-h-14 flex-col items-center justify-center rounded-2xl border px-1 py-2 text-center shadow-sm transition-[border-color,background-color,transform] duration-200",
                      selected
                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                        : "border-border/80 bg-card hover:border-primary/40 hover:bg-secondary",
                    )}
                    aria-pressed={selected}
                  >
                    <span className="text-base font-bold">{option.value}</span>
                    <span className="text-[0.65rem] font-semibold uppercase tracking-wide">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {formErrors.moodRating && (
              <p className="mt-1.5 text-sm text-destructive">{formErrors.moodRating.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="sleepHours"
        control={control}
        render={({ field }) => {
          const sleepHours = field.value ?? "";
          const sleepNumber = sleepHours === "" ? null : Number(sleepHours);

          return (
            <div>
              <Label htmlFor="sleepHours">Sleep hours</Label>
              <div className="mt-1.5 flex items-center gap-3">
                <button
                  type="button"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-input bg-card text-lg font-bold shadow-sm hover:border-primary/40"
                  onClick={() => field.onChange(nextSleepHours(field.value, -0.5))}
                  aria-label="Decrease sleep hours"
                >
                  −
                </button>
                <p className="min-w-0 flex-1 text-center text-2xl font-bold tabular-nums">
                  {sleepHours === "" ? "—" : sleepHours}
                  <span className="ml-1 text-sm font-semibold text-muted-foreground">hrs</span>
                </p>
                <button
                  type="button"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-input bg-card text-lg font-bold shadow-sm hover:border-primary/40"
                  onClick={() => field.onChange(nextSleepHours(field.value, 0.5))}
                  aria-label="Increase sleep hours"
                >
                  +
                </button>
              </div>
              <input
                id="sleepHours"
                type="range"
                min={0}
                max={24}
                step={0.5}
                value={sleepNumber == null || Number.isNaN(sleepNumber) ? 0 : sleepNumber}
                onChange={(event) => field.onChange(event.target.value)}
                className="mt-3 h-2 w-full cursor-pointer appearance-none bg-transparent accent-primary"
                aria-label="Sleep hours slider"
              />
              {formErrors.sleepHours && (
                <p className="mt-1.5 text-sm text-destructive">{formErrors.sleepHours.message}</p>
              )}
            </div>
          );
        }}
      />

      <div>
        <Label htmlFor="journalNotes">Journal notes</Label>
        <textarea
          id="journalNotes"
          rows={4}
          placeholder="Write anything you would like to remember about today..."
          className={textareaFieldClass}
          {...register("journalNotes")}
        />
        {formErrors.journalNotes && (
          <p className="mt-1.5 text-sm text-destructive">{formErrors.journalNotes.message}</p>
        )}
      </div>
    </div>
  );
}
