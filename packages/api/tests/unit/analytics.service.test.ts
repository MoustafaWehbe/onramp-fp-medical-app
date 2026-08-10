import { DailyEntry, EntrySymptom } from "../../src/models";
import { AnalyticsService } from "../../src/services/analytics.service";

jest.mock("../../src/models", () => ({
  UserSymptom: {},
  SymptomCatalog: {},
  DailyEntry: {
    findAll: jest.fn(),
  },
  EntrySymptom: {
    findAll: jest.fn(),
  },
}));

const mockDailyEntry = DailyEntry as jest.Mocked<typeof DailyEntry>;
const mockEntrySymptom = EntrySymptom as jest.Mocked<typeof EntrySymptom>;
const service = new AnalyticsService();

const userId = "00000000-0000-0000-0000-000000000001";

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── getDashboard ────────────────────────────────────────────────────────────

describe("AnalyticsService.getDashboard", () => {
  it("defaults the period to 30 days", async () => {
    const moodSpy = jest.spyOn(service, "getMoodTrend");
    const sleepSpy = jest.spyOn(service, "getSleepTrend");
    const symptomSpy = jest.spyOn(service, "getSymptomFrequency");
    mockDailyEntry.findAll.mockResolvedValue([]);
    mockEntrySymptom.findAll.mockResolvedValue([]);

    const result = await service.getDashboard({ userId });

    expect(result.period).toBe(30);
    expect(moodSpy).toHaveBeenCalledWith(userId, 30);
    expect(sleepSpy).toHaveBeenCalledWith(userId, 30);
    expect(symptomSpy).toHaveBeenCalledWith(userId, 30);
  });

  it("passes an explicit days value through", async () => {
    const moodSpy = jest.spyOn(service, "getMoodTrend");
    const sleepSpy = jest.spyOn(service, "getSleepTrend");
    const symptomSpy = jest.spyOn(service, "getSymptomFrequency");
    mockDailyEntry.findAll.mockResolvedValue([]);
    mockEntrySymptom.findAll.mockResolvedValue([]);

    const result = await service.getDashboard({ userId, days: 7 });

    expect(result.period).toBe(7);
    expect(moodSpy).toHaveBeenCalledWith(userId, 7);
    expect(sleepSpy).toHaveBeenCalledWith(userId, 7);
    expect(symptomSpy).toHaveBeenCalledWith(userId, 7);
  });
});

// ─── getMoodTrend ────────────────────────────────────────────────────────────

describe("AnalyticsService.getMoodTrend", () => {
  it("maps entries to date/value pairs with null fallbacks", async () => {
    mockDailyEntry.findAll.mockResolvedValue([
      { entryDate: "2026-01-09", moodRating: 4 },
      { entryDate: "2026-01-10", moodRating: null },
    ]);

    const result = await service.getMoodTrend(userId, 7);

    expect(mockDailyEntry.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId,
          entryDate: expect.any(Object),
        },
        attributes: ["entryDate", "moodRating"],
        order: [["entryDate", "ASC"]],
      }),
    );
    expect(result).toEqual([
      { date: "2026-01-09", value: 4 },
      { date: "2026-01-10", value: null },
    ]);
  });
});

// ─── getSleepTrend ───────────────────────────────────────────────────────────

describe("AnalyticsService.getSleepTrend", () => {
  it("maps entries to date/hours pairs with null fallbacks", async () => {
    mockDailyEntry.findAll.mockResolvedValue([
      { entryDate: "2026-01-09", sleepHours: 7.5 },
      { entryDate: "2026-01-10", sleepHours: null },
    ]);

    const result = await service.getSleepTrend(userId, 7);

    expect(mockDailyEntry.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId,
          entryDate: expect.any(Object),
        },
        attributes: ["entryDate", "sleepHours"],
        order: [["entryDate", "ASC"]],
      }),
    );
    expect(result).toEqual([
      { date: "2026-01-09", hours: 7.5 },
      { date: "2026-01-10", hours: null },
    ]);
  });
});

// ─── getSymptomFrequency ──────────────────────────────────────────────────────

describe("AnalyticsService.getSymptomFrequency", () => {
  it("maps raw symptom rows to symptom/count pairs", async () => {
    mockEntrySymptom.findAll.mockResolvedValue([
      { ["userSymptom.catalog.name"]: "Headache", count: "3" },
      { ["userSymptom.catalog.name"]: "Fever", count: "1" },
    ]);

    const result = await service.getSymptomFrequency(userId, 7);

    expect(mockEntrySymptom.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        raw: true,
        include: expect.any(Array),
      }),
    );
    expect(result).toEqual([
      { symptom: "Headache", count: 3 },
      { symptom: "Fever", count: 1 },
    ]);
  });

  it("returns an empty array when no symptoms are recorded", async () => {
    mockEntrySymptom.findAll.mockResolvedValue([]);

    const result = await service.getSymptomFrequency(userId, 7);

    expect(result).toEqual([]);
  });
});