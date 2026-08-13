import { describe, it, expect } from "vitest";
import {
  clinicFormSchema,
  doctorFormSchema,
} from "../../../../lib/health/providers/form";

const ID = "00000000-0000-0000-0000-000000000001";

describe("clinicFormSchema", () => {
  // ─── required-when-new fields ─────────────────────────────────────────────

  it("accepts a full new clinic with address and phone", () => {
    const result = clinicFormSchema.safeParse({
      nameQuery: "Main Street Clinic",
      address: "1 Main St",
      phone: "555-1234",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a new clinic without an address", () => {
    const result = clinicFormSchema.safeParse({
      nameQuery: "Main Street Clinic",
      phone: "555-1234",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a new clinic without a phone", () => {
    const result = clinicFormSchema.safeParse({
      nameQuery: "Main Street Clinic",
      address: "1 Main St",
    });
    expect(result.success).toBe(false);
  });

  it("accepts an existing clinic without address/phone", () => {
    const result = clinicFormSchema.safeParse({
      nameQuery: "Main Street Clinic",
      clinicId: ID,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty clinic name", () => {
    const result = clinicFormSchema.safeParse({
      nameQuery: "",
      clinicId: ID,
    });
    expect(result.success).toBe(false);
  });
});

// ─── doctor schema ───────────────────────────────────────────────────────────

describe("doctorFormSchema", () => {
  it("accepts a full new doctor with specialty and phone", () => {
    const result = doctorFormSchema.safeParse({
      nameQuery: "Dr. Smith",
      specialty: "Cardiology",
      phone: "555-5678",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a new doctor without a specialty", () => {
    const result = doctorFormSchema.safeParse({
      nameQuery: "Dr. Smith",
      phone: "555-5678",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a new doctor without a phone", () => {
    const result = doctorFormSchema.safeParse({
      nameQuery: "Dr. Smith",
      specialty: "Cardiology",
    });
    expect(result.success).toBe(false);
  });

  it("accepts an existing doctor without specialty/phone", () => {
    const result = doctorFormSchema.safeParse({
      nameQuery: "Dr. Smith",
      doctorId: ID,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty doctor name", () => {
    const result = doctorFormSchema.safeParse({
      nameQuery: "",
      doctorId: ID,
    });
    expect(result.success).toBe(false);
  });

  // ─── userClinicId empty-string preprocess ─────────────────────────────────

  it("turns an empty userClinicId string into undefined", () => {
    const result = doctorFormSchema.safeParse({
      nameQuery: "Dr. Smith",
      doctorId: ID,
      userClinicId: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.userClinicId).toBeUndefined();
    }
  });

  it("accepts a valid userClinicId uuid", () => {
    const result = doctorFormSchema.safeParse({
      nameQuery: "Dr. Smith",
      doctorId: ID,
      userClinicId: ID,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed userClinicId", () => {
    const result = doctorFormSchema.safeParse({
      nameQuery: "Dr. Smith",
      doctorId: ID,
      userClinicId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });
});
