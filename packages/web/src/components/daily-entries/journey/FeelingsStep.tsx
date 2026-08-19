import { useTranslation } from "react-i18next";
import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import type { DailyEntryFormValues } from "../../../lib/daily-entries/daily-entries-exports";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { cn } from "../../../lib/utils";
import { textareaFieldClass } from "./fieldStyles";

const MOOD_OPTIONS = [
  { value: "1" },
  { value: "2" },
  { value: "3" },
  { value: "4" },
  { value: "5" },
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
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="entryDate">{t("dailyEntries.journey.entryDate")}</Label>
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
              {t("dailyEntries.journey.moodRating")}
            </p>
            <div className="mt-2.5 grid grid-cols-5 gap-1.5" role="radiogroup" aria-labelledby="mood-label">
              {MOOD_OPTIONS.map((option) => {
                const selected = field.value === option.value;
                const moodKey =
                  option.value === "1"
                    ? "low"
                    : option.value === "2"
                      ? "off"
                      : option.value === "3"
                        ? "okay"
                        : option.value === "4"
                          ? "good"
                          : "great";
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    onClick={() => field.onChange(option.value)}
                    className={cn(
                      "flex min-h-14 flex-col items-center justify-center rounded-2xl border px-1 py-2 text-center shadow-sm transition-[border-color,background-color,transform] duration-200",
                      selected
                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                        : "border-border/80 bg-card hover:border-primary/40 hover:bg-secondary",
                    )}
                    aria-checked={selected}
                  >
                    <span className="text-base font-bold">{option.value}</span>
                    <span className="text-[0.65rem] font-semibold uppercase tracking-wide">
                      {t(`dailyEntries.journey.moodOptions.${moodKey}`)}
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
              <Label htmlFor="sleepHours">{t("dailyEntries.journey.sleepHours")}</Label>
              <div className="mt-1.5 flex items-center gap-3">
                <button
                  type="button"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-input bg-card text-lg font-bold shadow-sm hover:border-primary/40"
                  onClick={() => field.onChange(nextSleepHours(field.value, -0.5))}
                  aria-label={t("dailyEntries.journey.decreaseSleep")}
                >
                  −
                </button>
                <p
                  className="min-w-0 flex-1 text-center text-2xl font-bold tabular-nums"
                  aria-live="polite"
                >
                  {sleepHours === "" ? "—" : sleepHours}
                  <span className="ml-1 text-sm font-semibold text-muted-foreground">{t("dailyEntries.journey.hoursShort")}</span>
                </p>
                <button
                  type="button"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-input bg-card text-lg font-bold shadow-sm hover:border-primary/40"
                  onClick={() => field.onChange(nextSleepHours(field.value, 0.5))}
                  aria-label={t("dailyEntries.journey.increaseSleep")}
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
                aria-label={t("dailyEntries.journey.sleepHours")}
                aria-valuetext={
                  sleepHours === "" || sleepNumber == null || Number.isNaN(sleepNumber)
                    ? t("dailyEntries.journey.notSet")
                    : `${sleepNumber} ${t("dailyEntries.detail.hours")}`
                }
              />
              {formErrors.sleepHours && (
                <p className="mt-1.5 text-sm text-destructive">{formErrors.sleepHours.message}</p>
              )}
            </div>
          );
        }}
      />

      <div>
        <Label htmlFor="journalNotes">{t("dailyEntries.journey.journalNotes")}</Label>
        <textarea
          id="journalNotes"
          rows={4}
          placeholder={t("dailyEntries.journey.journalPlaceholder")}
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
