import { lookupMedicationCategory } from "../../src/lib/medication-category";

describe("lookupMedicationCategory", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("maps NSAID pharmacologic class to Painkiller", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          results: [
            {
              generic_name: "Ibuprofen",
              openfda: {
                pharm_class_epc: ["Nonsteroidal Anti-inflammatory Drug [EPC]"],
              },
            },
          ],
        }),
      }) as typeof fetch;

    await expect(lookupMedicationCategory("Ibuprofen")).resolves.toBe(
      "Painkiller",
    );
  });

  it("falls back to active ingredient mapping when class data is missing", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          results: [
            {
              brand_name: "PANADOL",
              generic_name: "acetaminophen",
              active_ingredients: [{ name: "ACETAMINOPHEN" }],
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ results: [] }),
      }) as typeof fetch;

    await expect(lookupMedicationCategory("PANADOL")).resolves.toBe(
      "Painkiller",
    );
  });

  it("uses label purpose text as a fallback", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          results: [{ purpose: ["Pain reliever/fever reducer"] }],
        }),
      }) as typeof fetch;

    await expect(lookupMedicationCategory("acetaminophen")).resolves.toBe(
      "Painkiller",
    );
  });

  it("returns null when no category can be resolved", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
      }) as typeof fetch;

    await expect(lookupMedicationCategory("unknown-medication")).resolves.toBe(
      null,
    );
  });

  it("returns null for blank input", async () => {
    await expect(lookupMedicationCategory("   ")).resolves.toBe(null);
    expect(global.fetch).toBe(originalFetch);
  });
});
