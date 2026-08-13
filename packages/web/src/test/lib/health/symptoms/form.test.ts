import { describe, it, expect } from "vitest";
import { symptomFormSchema } from "../../../../lib/health/symptoms/form";

const CATALOG_ID = "00000000-0000-0000-0000-000000000001";

describe("symptomFormSchema", () => {
  // ─── catalogId / onlineName at-least-one rule ─────────────────────────────

  it("rejects when both catalogId and onlineName are empty", () => {
    const result = symptomFormSchema.safeParse({
      nameQuery: "Headache",
      catalogId: undefined,
      onlineName: undefined,
    });
    expect(result.success).toBe(false);
  });

  it("accepts when only catalogId is set", () => {
    const result = symptomFormSchema.safeParse({
      nameQuery: "Headache",
      catalogId: CATALOG_ID,
      onlineName: undefined,
    });
    expect(result.success).toBe(true);
  });

  it("accepts when only onlineName is set", () => {
    const result = symptomFormSchema.safeParse({
      nameQuery: "Custom symptom",
      catalogId: undefined,
      onlineName: "Custom symptom",
    });
    expect(result.success).toBe(true);
  });

  it("accepts when both catalogId and onlineName are set", () => {
    const result = symptomFormSchema.safeParse({
      nameQuery: "Headache",
      catalogId: CATALOG_ID,
      onlineName: "Headache",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed catalogId when one is provided", () => {
    const result = symptomFormSchema.safeParse({
      nameQuery: "Headache",
      catalogId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty nameQuery", () => {
    const result = symptomFormSchema.safeParse({
      nameQuery: "",
      catalogId: CATALOG_ID,
    });
    expect(result.success).toBe(false);
  });
});
