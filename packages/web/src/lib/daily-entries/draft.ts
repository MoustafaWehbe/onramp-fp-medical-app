import {
  dailyEntryFormSchema,
  emptyDailyEntryFormValues,
  getTodayDate,
  type DailyEntryFormValues,
} from "./form";

export const DAILY_ENTRY_DRAFT_KEY =
  "daily-entry-create-draft";

export interface DailyEntryDraft {
  values: DailyEntryFormValues;
  step: number;
  savedOn?: string;
}

const LAST_STEP = 4;

export function readDailyEntryDraft(): DailyEntryDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(
      DAILY_ENTRY_DRAFT_KEY,
    );

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<DailyEntryDraft> | null;

    if (!parsed || typeof parsed.step !== "number" || !parsed.values) {
      return null;
    }

    const result = dailyEntryFormSchema.safeParse({
      ...emptyDailyEntryFormValues(),
      ...parsed.values,
    });

    if (!result.success) {
      return null;
    }

    return {
      values: {
        ...result.data,
        entryDate:  parsed.savedOn && parsed.savedOn !== getTodayDate()
        ? getTodayDate()
        : result.data.entryDate,
      },
      step: Math.min(
        Math.max(Math.trunc(parsed.step), 0),
        LAST_STEP,
      ),
    };
  } catch {
    return null;
  }
}

export function writeDailyEntryDraft(
  draft: DailyEntryDraft,
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      DAILY_ENTRY_DRAFT_KEY,
       JSON.stringify({
        ...draft,
        savedOn: getTodayDate(),
      }),
    );
  } catch {
    // Storage may be unavailable (private mode/quota); resuming is best-effort.
  }
}

export function clearDailyEntryDraft(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(
      DAILY_ENTRY_DRAFT_KEY,
    );
  } catch {
    // Ignore storage failures when clearing.
  }
}

export function isEmptyDailyEntryValues(
  values: DailyEntryFormValues,
): boolean {
  const empty = emptyDailyEntryFormValues();

  return (
    !values.moodRating &&
    !values.sleepHours &&
    !values.journalNotes?.trim() &&
    values.symptoms.length === 0 &&
    values.medications.length === 0 &&
    values.conditions.length === 0 &&
    values.doctorVisits.length === 0 &&
    values.entryDate === empty.entryDate
  );
}
