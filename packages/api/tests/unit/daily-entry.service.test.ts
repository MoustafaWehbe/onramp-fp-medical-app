import { Op, UniqueConstraintError } from "sequelize";
import {
  DailyEntry,
  EntryCondition,
  EntryDoctorVisit,
  EntryMedication,
  EntrySymptom,
} from "../../src/models";
import { getDatabase } from "../../src/lib/db";
import { entryIncludes } from "../../src/services/daily-entry/includes";
import { assertOwnedReferences } from "../../src/services/daily-entry/ownership";
import {
  insertChildren,
  rethrowUnique,
} from "../../src/services/daily-entry/children";
import { createError } from "../../src/middleware/error-handler";
import { DailyEntryService } from "../../src/services/daily-entry.service";

jest.mock("../../src/models", () => ({
  DailyEntry: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  EntryCondition: { destroy: jest.fn() },
  EntrySymptom: { destroy: jest.fn() },
  EntryMedication: { destroy: jest.fn() },
  EntryDoctorVisit: { destroy: jest.fn() },
}));

jest.mock("../../src/lib/db", () => ({
  getDatabase: jest.fn(),
}));

jest.mock("../../src/services/daily-entry/includes", () => ({
  entryIncludes: jest.fn(() => []),
}));

jest.mock("../../src/services/daily-entry/ownership", () => ({
  assertOwnedReferences: jest.fn(),
}));

jest.mock("../../src/services/daily-entry/children", () => ({
  insertChildren: jest.fn(),
  rethrowUnique: jest.fn(),
}));

const mockDailyEntry = DailyEntry as jest.Mocked<typeof DailyEntry>;
const mockEntryCondition = EntryCondition as jest.Mocked<typeof EntryCondition>;
const mockEntrySymptom = EntrySymptom as jest.Mocked<typeof EntrySymptom>;
const mockEntryMedication = EntryMedication as jest.Mocked<typeof EntryMedication>;
const mockEntryDoctorVisit = EntryDoctorVisit as jest.Mocked<
  typeof EntryDoctorVisit
>;
const mockGetDatabase = getDatabase as jest.Mocked<typeof getDatabase>;
const mockEntryIncludes = entryIncludes as jest.MockedFunction<typeof entryIncludes>;
const mockAssertOwnedReferences = assertOwnedReferences as jest.MockedFunction<
  typeof assertOwnedReferences
>;
const mockInsertChildren = insertChildren as jest.MockedFunction<
  typeof insertChildren
>;
const mockRethrowUnique = rethrowUnique as jest.MockedFunction<typeof rethrowUnique>;
const service = new DailyEntryService();

const userId = "00000000-0000-0000-0000-000000000001";
const fakeTx = { isTransaction: true };
const entryRow = {
  id: "entry-1",
  userId,
  entryDate: "2026-01-10",
  moodRating: 5,
  sleepHours: 7.5,
  journalNotes: "Feeling better",
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetDatabase.mockReturnValue({
    transaction: jest.fn(async (cb: (txn: unknown) => unknown) => cb(fakeTx)),
  } as never);
});

// ─── list ─────────────────────────────────────────────────────────────────────

describe("DailyEntryService.list", () => {
  it("returns a paginated list of the user entries", async () => {
    mockDailyEntry.count.mockResolvedValue(1);
    mockDailyEntry.findAll
      .mockResolvedValueOnce([{ id: "entry-1" }])
      .mockResolvedValueOnce([entryRow]);

    const result = await service.list({ userId, currentPage: 1, pageSize: 10 });

    expect(mockDailyEntry.count).toHaveBeenCalledWith({
      where: { userId },
    });
    expect(mockDailyEntry.findAll).toHaveBeenCalledTimes(2);
    expect(mockDailyEntry.findAll).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: {
          userId,
          id: { [Op.in]: ["entry-1"] },
        },
        include: [],
      }),
    );
    expect(result.data).toEqual([entryRow]);
  });

  it("builds a between clause when both dates are provided", async () => {
    mockDailyEntry.count.mockResolvedValue(0);
    mockDailyEntry.findAll.mockResolvedValue([]);

    await service.list({
      userId,
      currentPage: 1,
      pageSize: 10,
      fromDate: "2026-01-01",
      toDate: "2026-01-07",
    });

    expect(mockDailyEntry.count).toHaveBeenCalledWith({
      where: { userId, entryDate: { [Op.between]: ["2026-01-01", "2026-01-07"] } },
    });
  });

  it("builds a gte clause when only fromDate is provided", async () => {
    mockDailyEntry.count.mockResolvedValue(0);
    mockDailyEntry.findAll.mockResolvedValue([]);

    await service.list({ userId, currentPage: 1, pageSize: 10, fromDate: "2026-01-01" });

    expect(mockDailyEntry.count).toHaveBeenCalledWith({
      where: { userId, entryDate: { [Op.gte]: "2026-01-01" } },
    });
  });

  it("builds a lte clause when only toDate is provided", async () => {
    mockDailyEntry.count.mockResolvedValue(0);
    mockDailyEntry.findAll.mockResolvedValue([]);

    await service.list({ userId, currentPage: 1, pageSize: 10, toDate: "2026-01-07" });

    expect(mockDailyEntry.count).toHaveBeenCalledWith({
      where: { userId, entryDate: { [Op.lte]: "2026-01-07" } },
    });
  });

  it("short-circuits and returns an empty page when no entries match", async () => {
    mockDailyEntry.count.mockResolvedValue(5);
    mockDailyEntry.findAll.mockResolvedValue([]);

    const result = await service.list({ userId, currentPage: 1, pageSize: 10 });

    expect(mockDailyEntry.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      data: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalCount: 5,
        totalPages: 1,
      },
    });
  });
});

// ─── getById ──────────────────────────────────────────────────────────────────

describe("DailyEntryService.getById", () => {
  it("returns the entry when found", async () => {
    mockDailyEntry.findOne.mockResolvedValue(entryRow);

    const result = await service.getById(userId, "entry-1");

    expect(mockEntryIncludes).toHaveBeenCalled();
    expect(mockDailyEntry.findOne).toHaveBeenCalledWith({
      where: { id: "entry-1", userId },
      include: [],
    });
    expect(result).toEqual(entryRow);
  });

  it("throws 404 when the entry is not found", async () => {
    mockDailyEntry.findOne.mockResolvedValue(null);

    const error = await service.getById(userId, "missing").catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Daily entry not found",
      statusCode: 404,
    });
  });
});

// ─── create ───────────────────────────────────────────────────────────────────

describe("DailyEntryService.create", () => {
  const input = { userId, entryDate: "2026-01-10", moodRating: 5 };

  it("creates the entry, inserts children and re-fetches", async () => {
    mockAssertOwnedReferences.mockResolvedValue(undefined);
    mockDailyEntry.create.mockResolvedValue({ id: "entry-1" } as never);
    mockInsertChildren.mockResolvedValue(undefined);
    mockDailyEntry.findOne.mockResolvedValue(entryRow);

    const result = await service.create(input);

    expect(mockAssertOwnedReferences).toHaveBeenCalledWith(input, userId, fakeTx);
    expect(mockDailyEntry.create).toHaveBeenCalledWith(
      {
        userId,
        entryDate: "2026-01-10",
        moodRating: 5,
        sleepHours: undefined,
        journalNotes: undefined,
      },
      { transaction: fakeTx },
    );
    expect(mockInsertChildren).toHaveBeenCalledWith("entry-1", input, fakeTx);
    expect(mockDailyEntry.findOne).toHaveBeenCalledWith({
      where: { id: "entry-1", userId },
      include: [],
    });
    expect(result).toEqual(entryRow);
  });

  it("rethrows a unique error as 409", async () => {
    mockAssertOwnedReferences.mockResolvedValue(undefined);
    mockDailyEntry.create.mockRejectedValue(new UniqueConstraintError());
    mockRethrowUnique.mockImplementation(() => {
      throw createError("Daily entry already exists for this date", 409);
    });

    const error = await service.create(input).catch((e: unknown) => e);

    expect(mockRethrowUnique).toHaveBeenCalledWith(
      expect.any(UniqueConstraintError),
      "Daily entry already exists for this date",
    );
    expect(error).toMatchObject({
      message: "Daily entry already exists for this date",
      statusCode: 409,
    });
    expect(mockInsertChildren).not.toHaveBeenCalled();
  });
});

// ─── update ───────────────────────────────────────────────────────────────────

describe("DailyEntryService.update", () => {
  const entry = {
    id: "entry-1",
    set: jest.fn(),
    save: jest.fn().mockResolvedValue(undefined),
  };

  it("throws 404 when the entry is not found", async () => {
    mockDailyEntry.findOne.mockResolvedValue(null);

    const error = await service
      .update({ userId, id: "missing", moodRating: 4 })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Daily entry not found",
      statusCode: 404,
    });
  });

  it("sets fields, saves and re-fetches", async () => {
    mockDailyEntry.findOne
      .mockResolvedValueOnce(entry as never)
      .mockResolvedValueOnce(entryRow);
    mockAssertOwnedReferences.mockResolvedValue(undefined);
    mockInsertChildren.mockResolvedValue(undefined);

    const result = await service.update({
      userId,
      id: "entry-1",
      moodRating: 4,
      journalNotes: "Updated notes",
    });

    expect(entry.set).toHaveBeenCalledWith("moodRating", 4);
    expect(entry.set).toHaveBeenCalledWith("journalNotes", "Updated notes");
    expect(entry.save).toHaveBeenCalledWith({ transaction: fakeTx });
    expect(mockInsertChildren).toHaveBeenCalledWith("entry-1", expect.anything(), fakeTx);
    expect(mockDailyEntry.findOne).toHaveBeenCalledTimes(2);
    expect(result).toEqual(entryRow);
  });

  it("destroys replaced child rows when provided", async () => {
    mockDailyEntry.findOne
      .mockResolvedValueOnce(entry as never)
      .mockResolvedValueOnce(entryRow);
    mockAssertOwnedReferences.mockResolvedValue(undefined);
    mockInsertChildren.mockResolvedValue(undefined);

    await service.update({
      userId,
      id: "entry-1",
      symptoms: [{ userSymptomId: "user-symptom-1" }],
      conditions: [{ userConditionId: "user-condition-1" }],
      medications: [{ userMedicationId: "user-medication-1", unit: "mg" }],
      doctorVisits: [{ userDoctorId: "user-doctor-1" }],
    });

    expect(mockEntrySymptom.destroy).toHaveBeenCalledWith({
      where: { entryId: "entry-1" },
      transaction: fakeTx,
    });
    expect(mockEntryCondition.destroy).toHaveBeenCalledWith({
      where: { entryId: "entry-1" },
      transaction: fakeTx,
    });
    expect(mockEntryMedication.destroy).toHaveBeenCalledWith({
      where: { entryId: "entry-1" },
      transaction: fakeTx,
    });
    expect(mockEntryDoctorVisit.destroy).toHaveBeenCalledWith({
      where: { entryId: "entry-1" },
      transaction: fakeTx,
    });
  });

  it("skips child destroy when no child arrays are provided", async () => {
    mockDailyEntry.findOne
      .mockResolvedValueOnce(entry as never)
      .mockResolvedValueOnce(entryRow);
    mockAssertOwnedReferences.mockResolvedValue(undefined);
    mockInsertChildren.mockResolvedValue(undefined);

    await service.update({ userId, id: "entry-1", moodRating: 3 });

    expect(mockEntrySymptom.destroy).not.toHaveBeenCalled();
    expect(mockEntryCondition.destroy).not.toHaveBeenCalled();
  });
});

// ─── remove ───────────────────────────────────────────────────────────────────

describe("DailyEntryService.remove", () => {
  it("throws 404 when the entry is not found", async () => {
    mockDailyEntry.findOne.mockResolvedValue(null);

    const error = await service.remove(userId, "missing").catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Daily entry not found",
      statusCode: 404,
    });
  });

  it("destroys the entry and returns a deleted message", async () => {
    const entry = { id: "entry-1", destroy: jest.fn().mockResolvedValue(undefined) };
    mockDailyEntry.findOne.mockResolvedValue(entry);

    const result = await service.remove(userId, "entry-1");

    expect(entry.destroy).toHaveBeenCalled();
    expect(result).toEqual({ id: "entry-1", message: "Deleted" });
  });
});