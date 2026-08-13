// web's date check is looser than api's (no future-date guard on web)
import { describe, it, expect } from "vitest";
import { conditionFormSchema } from "../../../../lib/health/conditions/form";

const CONDITION_ID = "00000000-0000-0000-0000-000000000001";

function validCondition() {
  return { nameQuery: "Asthma", conditionId: CONDITION_ID };
}

describe("conditionFormSchema", () => {
  // ─── diagnosedDate parse rule ─────────────────────────────────────────────

  it("accepts a valid date string", () => {
    const result = conditionFormSchema.safeParse({
      ...validCondition(),
      diagnosedDate: "2024-01-15",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unparseable date string", () => {
    const result = conditionFormSchema.safeParse({
      ...validCondition(),
      diagnosedDate: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("allows an empty diagnosedDate", () => {
    const result = conditionFormSchema.safeParse({
      ...validCondition(),
      diagnosedDate: "",
    });
    expect(result.success).toBe(true);
  });

  it("allows a future date (no future-date guard on web)", () => {
    const result = conditionFormSchema.safeParse({
      ...validCondition(),
      diagnosedDate: "2030-01-15",
    });
    expect(result.success).toBe(true);
  });

  // ─── status enum ──────────────────────────────────────────────────────────

  it("accepts each valid status value", () => {
    for (const status of ["active", "inactive", "resolved"]) {
      const result = conditionFormSchema.safeParse({
        ...validCondition(),
        status,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects an invalid status value", () => {
    const result = conditionFormSchema.safeParse({
      ...validCondition(),
      status: "cured",
    });
    expect(result.success).toBe(false);
  });

  it("allows an omitted status (stays undefined, .default() is inert)", () => {
    const result = conditionFormSchema.safeParse(validCondition());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBeUndefined();
    }
  });
});
