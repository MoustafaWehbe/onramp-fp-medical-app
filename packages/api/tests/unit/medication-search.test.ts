import { searchMedicationNames } from "../../src/lib/medication-search";

describe("searchMedicationNames", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("returns up to 10 clean brand names and ignores compound ingredient lists", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          results: [
            { brand_name: "Ibuprofen", generic_name: "ibuprofen" },
            { brand_name: "Ibuprofen Minis", generic_name: "IBUPROFEN" },
            {
              brand_name: "Children's Ibuprofen",
              generic_name: "Ibuprofen Oral Suspension",
            },
            {
              brand_name:
                "Acid Phos, Agnus Castus, Caladium seg, Panax Ginseng, Selenium",
              generic_name: "homeopathic blend",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 404,
      }) as typeof fetch;

    const names = await searchMedicationNames("ibupro");

    expect(names).toEqual([
      "Ibuprofen",
      "Ibuprofen Minis",
      "Children's Ibuprofen",
    ]);
    expect(names.length).toBeLessThanOrEqual(10);
  });

  it("adds simple generic names when brand results are insufficient", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          results: [{ brand_name: "Panadol", generic_name: "acetaminophen" }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          results: [
            {
              brand_name: "Other Brand",
              generic_name: "acetaminophen and diphenhydramine HCl",
            },
            { generic_name: "acetaminophen" },
          ],
        }),
      }) as typeof fetch;

    const names = await searchMedicationNames("acet");

    expect(names).toEqual(["acetaminophen"]);
  });

  it("returns an empty array when OpenFDA has no matches", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
    }) as typeof fetch;

    await expect(searchMedicationNames("xyznone")).resolves.toEqual([]);
  });

  it("returns an empty array for blank search", async () => {
    await expect(searchMedicationNames("   ")).resolves.toEqual([]);
    expect(global.fetch).toBe(originalFetch);
  });
});
