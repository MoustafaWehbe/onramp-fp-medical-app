import {
  DailyEntry,
  EntryDoctorVisit,
  UserMedication,
  UserCondition,
} from "../../src/models";
import { DashboardService } from "../../src/services/dashboard.service";

jest.mock("../../src/models", () => ({
  UserDoctor: {},
  UserClinic: {},
  Doctor: {},
  Clinic: {},
  DailyEntry: {
    count: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
  },
  UserMedication: {
    count: jest.fn(),
  },
  UserCondition: {
    count: jest.fn(),
  },
  EntryDoctorVisit: {
    findOne: jest.fn(),
  },
}));

const mockDailyEntry = DailyEntry as jest.Mocked<typeof DailyEntry>;
const mockEntryDoctorVisit = EntryDoctorVisit as jest.Mocked<
  typeof EntryDoctorVisit
>;
const mockUserMedication = UserMedication as jest.Mocked<typeof UserMedication>;
const mockUserCondition = UserCondition as jest.Mocked<typeof UserCondition>;
const service = new DashboardService();

const userId = "00000000-0000-0000-0000-000000000001";

const sourceWithPrivate = service as unknown as {
  getAvgMood: (userId: string, days: number) => Promise<number | null>;
  getLastVisit: (
    userId: string,
  ) => Promise<{
    date: string;
    doctorName: string;
    clinicName: string | null;
    summary: string | null;
  } | null>;
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── getDashboard ────────────────────────────────────────────────────────────

describe("DashboardService.getDashboard", () => {
  it("returns the aggregated dashboard shape", async () => {
    mockDailyEntry.count.mockResolvedValue(3);
    mockUserMedication.count.mockResolvedValue(2);
    mockUserCondition.count.mockResolvedValue(5);
    mockDailyEntry.findOne.mockResolvedValue({ avgMood: 4.6 });
    mockEntryDoctorVisit.findOne.mockResolvedValue(null);
    mockDailyEntry.findAll.mockResolvedValue([
      {
        id: "entry-1",
        entryDate: "2026-01-10",
        moodRating: 4,
        sleepHours: 7.5,
        journalNotes: "Feeling good",
      },
    ]);

    const result = await service.getDashboard(userId);

    expect(mockDailyEntry.count).toHaveBeenCalledWith({
      where: {
        userId,
        entryDate: expect.any(Object),
      },
    });
    expect(mockUserMedication.count).toHaveBeenCalledWith({
      where: { userId, active: true },
    });
    expect(mockUserCondition.count).toHaveBeenCalledWith({
      where: { userId, active: true },
    });
    expect(result).toEqual({
      stats: {
        entryCount: 3,
        activeMedicationCount: 2,
        activeConditionCount: 5,
        avgMood: 4.6,
      },
      recentEntries: [
        {
          id: "entry-1",
          entryDate: "2026-01-10",
          moodRating: 4,
          sleepHours: 7.5,
          journalSnippet: "Feeling good",
        },
      ],
      lastVisit: null,
    });
  });

  it("maps recent entries with null-safe values and truncated journal snippet", async () => {
    mockDailyEntry.count.mockResolvedValue(0);
    mockUserMedication.count.mockResolvedValue(0);
    mockUserCondition.count.mockResolvedValue(0);
    mockDailyEntry.findOne.mockResolvedValue(null);
    mockEntryDoctorVisit.findOne.mockResolvedValue(null);
    mockDailyEntry.findAll.mockResolvedValue([
      {
        id: "entry-2",
        entryDate: "2026-01-11",
        moodRating: null,
        sleepHours: null,
        journalNotes: null,
      },
    ]);

    const result = await service.getDashboard(userId);

    expect(result.stats.avgMood).toBeNull();
    expect(result.recentEntries).toEqual([
      {
        id: "entry-2",
        entryDate: "2026-01-11",
        moodRating: null,
        sleepHours: null,
        journalSnippet: null,
      },
    ]);
  });
});

// ─── getAvgMood ───────────────────────────────────────────────────────────────

describe("DashboardService.getAvgMood", () => {
  it("rounds the average mood to one decimal place", async () => {
    mockDailyEntry.findOne.mockResolvedValue({ avgMood: 4.26 });

    const avg = await sourceWithPrivate.getAvgMood(userId, 7);

    expect(avg).toBe(4.3);
  });

  it("returns null when the average mood is null", async () => {
    mockDailyEntry.findOne.mockResolvedValue({ avgMood: null });

    const avg = await sourceWithPrivate.getAvgMood(userId, 7);

    expect(avg).toBeNull();
  });

  it("returns null when no row is found", async () => {
    mockDailyEntry.findOne.mockResolvedValue(null);

    const avg = await sourceWithPrivate.getAvgMood(userId, 7);

    expect(avg).toBeNull();
  });
});

// ─── getLastVisit ────────────────────────────────────────────────────────────

describe("DashboardService.getLastVisit", () => {
  it("maps a found visit with nested doctor and clinic names", async () => {
    mockEntryDoctorVisit.findOne.mockResolvedValue({
      entry: { entryDate: "2026-01-10" },
      userDoctor: { doctor: { name: "Jane Doe" } },
      userClinic: { clinic: { name: "City Medical Center" } },
      summary: "Routine checkup",
    });

    const visit = await sourceWithPrivate.getLastVisit(userId);

    expect(visit).toEqual({
      date: "2026-01-10",
      doctorName: "Jane Doe",
      clinicName: "City Medical Center",
      summary: "Routine checkup",
    });
  });

  it("returns null when no visit is found", async () => {
    mockEntryDoctorVisit.findOne.mockResolvedValue(null);

    const visit = await sourceWithPrivate.getLastVisit(userId);

    expect(visit).toBeNull();
  });

  it("falls back to defaults when nested data is missing", async () => {
    mockEntryDoctorVisit.findOne.mockResolvedValue({
      entry: { entryDate: "2026-01-10" },
      userDoctor: {},
      userClinic: null,
      summary: null,
    });

    const visit = await sourceWithPrivate.getLastVisit(userId);

    expect(visit).toEqual({
      date: "2026-01-10",
      doctorName: "Unknown",
      clinicName: null,
      summary: null,
    });
  });
});