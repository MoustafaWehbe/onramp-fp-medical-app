import { describe, it, expect } from "vitest";
import { medicationFormSchema } from "../../../../lib/health/medications/form";

const MEDICATION_ID = "00000000-0000-0000-0000-000000000001";

describe("medicationFormSchema", () => {
  // ─── dosage / unit cross-field rule ───────────────────────────────────────

  it("accepts dosage and unit provided together", () => {
    const result = medicationFormSchema.safeParse({
      nameQuery: "Ibuprofen",
      medicationId: MEDICATION_ID,
      dosage: "5",
      dosageMeasurement: "mg",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a dosage without a unit", () => {
    const result = medicationFormSchema.safeParse({
      nameQuery: "Ibuprofen",
      medicationId: MEDICATION_ID,
      dosage: "5",
      dosageMeasurement: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a unit without a dosage", () => {
    const result = medicationFormSchema.safeParse({
      nameQuery: "Ibuprofen",
      medicationId: MEDICATION_ID,
      dosage: "",
      dosageMeasurement: "mg",
    });
    expect(result.success).toBe(false);
  });

  it("allows both dosage and unit to be empty", () => {
    const result = medicationFormSchema.safeParse({
      nameQuery: "Ibuprofen",
      medicationId: MEDICATION_ID,
      dosage: "",
      dosageMeasurement: "",
    });
    expect(result.success).toBe(true);
  });

  // ─── dosage value validation ──────────────────────────────────────────────

  it("rejects a zero dosage", () => {
    const result = medicationFormSchema.safeParse({
      nameQuery: "Ibuprofen",
      medicationId: MEDICATION_ID,
      dosage: "0",
      dosageMeasurement: "mg",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a negative dosage", () => {
    const result = medicationFormSchema.safeParse({
      nameQuery: "Ibuprofen",
      medicationId: MEDICATION_ID,
      dosage: "-5",
      dosageMeasurement: "mg",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-numeric dosage", () => {
    const result = medicationFormSchema.safeParse({
      nameQuery: "Ibuprofen",
      medicationId: MEDICATION_ID,
      dosage: "abc",
      dosageMeasurement: "mg",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a large dosage (no upper bound)", () => {
    const result = medicationFormSchema.safeParse({
      nameQuery: "Ibuprofen",
      medicationId: MEDICATION_ID,
      dosage: "99999",
      dosageMeasurement: "mg",
    });
    expect(result.success).toBe(true);
  });

  // ─── medication selection rule ────────────────────────────────────────────

  it("accepts an onlineName instead of a medicationId", () => {
    const result = medicationFormSchema.safeParse({
      nameQuery: "Brand-New Drug",
      onlineName: "Brand-New Drug",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when neither medicationId nor onlineName is set", () => {
    const result = medicationFormSchema.safeParse({ nameQuery: "Ibuprofen" });
    expect(result.success).toBe(false);
  });
});
