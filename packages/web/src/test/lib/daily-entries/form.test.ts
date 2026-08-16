import { describe, it, expect } from "vitest";
import {
  dailyEntryFormSchema,
  toDailyEntrySubmitPayload,
  type DailyEntryFormValues,
} from "../../../lib/daily-entries/form";

const USER_ID = "00000000-0000-0000-0000-000000000001";

function validEntry(): DailyEntryFormValues {
  return {
    entryDate: "2026-07-28",
    moodRating: "3",
    sleepHours: "7.5",
    journalNotes: "Feeling okay",
    symptoms: [],
    medications: [],
    conditions: [],
    doctorVisits: [],
  };
}

describe("dailyEntryFormSchema", () => {
  // ─── symptom severity (1-10, whole number) ────────────────────────────────

  it("accepts severity at the bounds (1 and 10)", () => {
    for (const severity of ["1", "10"]) {
      const result = dailyEntryFormSchema.safeParse({
        ...validEntry(),
        symptoms: [{ userSymptomId: USER_ID, severity }],
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects severity outside 1-10", () => {
    for (const severity of ["0", "11", "-1"]) {
      const result = dailyEntryFormSchema.safeParse({
        ...validEntry(),
        symptoms: [{ userSymptomId: USER_ID, severity }],
      });
      expect(result.success).toBe(false);
    }
  });

  it("rejects non-whole-number severity", () => {
    for (const severity of ["1.5", "abc", ""]) {
      const result = dailyEntryFormSchema.safeParse({
        ...validEntry(),
        symptoms: [{ userSymptomId: USER_ID, severity }],
      });
      expect(result.success).toBe(false);
    }
  });

  // ─── medication quantity (> 0, whole number) ──────────────────────────────

  it("accepts quantity at the lower bound (1)", () => {
    const result = dailyEntryFormSchema.safeParse({
      ...validEntry(),
      medications: [
        { userMedicationId: USER_ID, quantity: "1", unit: "mg", taken: false },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects quantity 0 and negatives", () => {
    for (const quantity of ["0", "-1"]) {
      const result = dailyEntryFormSchema.safeParse({
        ...validEntry(),
        medications: [
          { userMedicationId: USER_ID, quantity, unit: "mg", taken: false },
        ],
      });
      expect(result.success).toBe(false);
    }
  });

  it("rejects non-whole-number quantity", () => {
    for (const quantity of ["1.5", "abc", ""]) {
      const result = dailyEntryFormSchema.safeParse({
        ...validEntry(),
        medications: [
          { userMedicationId: USER_ID, quantity, unit: "mg", taken: false },
        ],
      });
      expect(result.success).toBe(false);
    }
  });

  it("rejects a medication with an empty unit", () => {
    const result = dailyEntryFormSchema.safeParse({
      ...validEntry(),
      medications: [
        { userMedicationId: USER_ID, quantity: "2", unit: "", taken: true },
      ],
    });
    expect(result.success).toBe(false);
  });

  // ─── sleep hours (0-24) ───────────────────────────────────────────────────

  it("accepts sleep hours at the bounds (0 and 24)", () => {
    for (const sleepHours of ["0", "24"]) {
      const result = dailyEntryFormSchema.safeParse({
        ...validEntry(),
        sleepHours,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects sleep hours outside 0-24", () => {
    for (const sleepHours of ["-1", "24.01", "25"]) {
      const result = dailyEntryFormSchema.safeParse({
        ...validEntry(),
        sleepHours,
      });
      expect(result.success).toBe(false);
    }
  });

  it("allows fractional sleep hours (e.g. 7.5)", () => {
    const result = dailyEntryFormSchema.safeParse({
      ...validEntry(),
      sleepHours: "7.5",
    });
    expect(result.success).toBe(true);
  });

  it("allows empty sleep hours", () => {
    const result = dailyEntryFormSchema.safeParse({
      ...validEntry(),
      sleepHours: "",
    });
    expect(result.success).toBe(true);
  });

  // ─── mood rating (1-5, whole number) ──────────────────────────────────────

  it("accepts mood ratings at the bounds (1 and 5)", () => {
    for (const moodRating of ["1", "5"]) {
      const result = dailyEntryFormSchema.safeParse({
        ...validEntry(),
        moodRating,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects mood ratings outside 1-5", () => {
    for (const moodRating of ["0", "6", "1.5", "abc"]) {
      const result = dailyEntryFormSchema.safeParse({
        ...validEntry(),
        moodRating,
      });
      expect(result.success).toBe(false);
    }
  });

  it("allows an empty mood rating", () => {
    const result = dailyEntryFormSchema.safeParse({
      ...validEntry(),
      moodRating: "",
    });
    expect(result.success).toBe(true);
  });

  // ─── valid full entry ─────────────────────────────────────────────────────

  it("accepts a fully populated valid entry", () => {
    const result = dailyEntryFormSchema.safeParse({
      ...validEntry(),
      symptoms: [{ userSymptomId: USER_ID, severity: "4", notes: "mild" }],
      medications: [
        {
          userMedicationId: USER_ID,
          quantity: "2",
          unit: "tablet",
          taken: true,
          takenAt: "14:30",
          notes: "after lunch",
        },
      ],
      conditions: [{ userConditionId: USER_ID, status: "active" }],
      doctorVisits: [
        { userDoctorId: USER_ID, userClinicId: USER_ID, summary: "Checkup" },
      ],
    });
    expect(result.success).toBe(true);
  });
});

// ─── takenAt -> ISO conversion ───────────────────────────────────────────────

describe("toDailyEntrySubmitPayload", () => {
  it("converts a takenAt time to a full ISO timestamp", () => {
    const payload = toDailyEntrySubmitPayload({
      ...validEntry(),
      medications: [
        {
          userMedicationId: USER_ID,
          quantity: "2",
          unit: "mg",
          taken: true,
          takenAt: "14:30",
        },
      ],
    });

    const iso = payload.medications[0].takenAt as string;
    const date = new Date(iso);

    expect(date.getHours()).toBe(14);
    expect(date.getMinutes()).toBe(30);
    expect(iso.endsWith("Z")).toBe(true);
  });

  it("sends null when takenAt is empty", () => {
    const payload = toDailyEntrySubmitPayload({
      ...validEntry(),
      medications: [
        {
          userMedicationId: USER_ID,
          quantity: "2",
          unit: "mg",
          taken: false,
          takenAt: "",
        },
      ],
    });

    expect(payload.medications[0].takenAt).toBeNull();
  });

  it("coerces string form fields to numbers in the payload", () => {
    const payload = toDailyEntrySubmitPayload({
      ...validEntry(),
      moodRating: "4",
      sleepHours: "7.5",
      symptoms: [{ userSymptomId: USER_ID, severity: "3" }],
    });

    expect(payload.moodRating).toBe(4);
    expect(payload.sleepHours).toBe(7.5);
    expect(payload.symptoms[0].severity).toBe(3);
  });
});
