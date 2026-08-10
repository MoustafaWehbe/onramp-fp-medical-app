import { DailyEntry, EntryDoctorVisit, UserClinic, UserDoctor } from "../../src/models";
import {
  entryDoctorVisitService,
  EntryDoctorVisitService,
} from "../../src/services/entry-doctor-visit.service";

jest.mock("../../src/models", () => ({
  DailyEntry: {},
  UserDoctor: {},
  UserClinic: {},
  EntryDoctorVisit: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
  },
}));

const mockEntryDoctorVisit = EntryDoctorVisit as jest.Mocked<typeof EntryDoctorVisit>;
const service = new EntryDoctorVisitService();

const userId = "00000000-0000-0000-0000-000000000001";
const visitRow = {
  id: "doctor-visit-1",
  summary: "Routine checkup",
  entry: { id: "entry-1", entryDate: "2026-01-10" },
  userDoctor: {
    id: "user-doctor-1",
    doctor: { id: "doctor-1", name: "Jane Doe", specialty: "Cardiology" },
  },
  userClinic: {
    id: "user-clinic-1",
    clinic: { id: "clinic-1", name: "City Medical Center", address: "123 Main St" },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── list ─────────────────────────────────────────────────────────────────────

describe("EntryDoctorVisitService.list", () => {
  it("returns a paginated list of doctor visits scoped to the user", async () => {
    mockEntryDoctorVisit.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [visitRow],
    });

    const result = await service.list({ userId, currentPage: 1, pageSize: 10 });

    expect(mockEntryDoctorVisit.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.any(Array),
        order: expect.any(Array),
        limit: 10,
        offset: 0,
        distinct: true,
      }),
    );
    expect(result.data).toEqual([visitRow]);
  });
});

// ─── getById ──────────────────────────────────────────────────────────────────

describe("EntryDoctorVisitService.getById", () => {
  it("returns the doctor visit with includes when found", async () => {
    mockEntryDoctorVisit.findOne.mockResolvedValue(visitRow);

    const result = await service.getById(userId, "doctor-visit-1");

    expect(mockEntryDoctorVisit.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "doctor-visit-1" },
        include: expect.any(Array),
      }),
    );
    expect(result).toEqual(visitRow);
  });

  it("throws 404 when the doctor visit is not found", async () => {
    mockEntryDoctorVisit.findOne.mockResolvedValue(null);

    const error = await service.getById(userId, "missing").catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Doctor visit not found",
      statusCode: 404,
    });
  });
});