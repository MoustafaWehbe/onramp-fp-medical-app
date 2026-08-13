import { UniqueConstraintError } from "sequelize";
import { Clinic, UserClinic } from "../../src/models";
import { UserClinicService } from "../../src/services/user-clinic.service";

jest.mock("../../src/models", () => ({
  Clinic: {
    findByPk: jest.fn(),
  },
  UserClinic: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const mockClinic = Clinic as jest.Mocked<typeof Clinic>;
const mockUserClinic = UserClinic as jest.Mocked<typeof UserClinic>;
const service = new UserClinicService();

const userId = "00000000-0000-0000-0000-000000000001";
const ownedRecord = {
  id: "user-clinic-1",
  userId,
  clinicId: "clinic-1",
  notes: "Primary clinic",
  active: true,
  clinic: { id: "clinic-1", name: "City Medical Center" },
  setDataValue: jest.fn(),
  save: jest.fn().mockResolvedValue(undefined),
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── list ─────────────────────────────────────────────────────────────────────

describe("UserClinicService.list", () => {
  it("returns a paginated list scoped to the user", async () => {
    mockUserClinic.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [ownedRecord],
    });

    const result = await service.list({ userId, currentPage: 1, pageSize: 10 });

    expect(mockUserClinic.findAndCountAll).toHaveBeenCalledWith({
      where: { userId },
      include: [expect.any(Object)],
      order: [
        ["createdAt", "DESC"],
        ["id", "ASC"],
      ],
      limit: 10,
      offset: 0,
      distinct: true,
    });
    expect(result.data).toEqual([ownedRecord]);
  });
});

// ─── getById ──────────────────────────────────────────────────────────────────

describe("UserClinicService.getById", () => {
  it("returns the user clinic when found", async () => {
    mockUserClinic.findOne.mockResolvedValue(ownedRecord);

    const result = await service.getById(userId, "user-clinic-1");

    expect(mockUserClinic.findOne).toHaveBeenCalledWith({
      where: { id: "user-clinic-1", userId },
      include: [expect.any(Object)],
    });
    expect(result).toEqual(ownedRecord);
  });

  it("throws 404 when the user clinic is not found", async () => {
    mockUserClinic.findOne.mockResolvedValue(null);

    const error = await service.getById(userId, "missing").catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User clinic not found",
      statusCode: 404,
    });
  });
});

// ─── create ───────────────────────────────────────────────────────────────────

describe("UserClinicService.create", () => {
  it("throws 404 when the clinic does not exist", async () => {
    mockClinic.findByPk.mockResolvedValue(null);

    const error = await service
      .create({ userId, clinicId: "missing-clinic" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Clinic not found",
      statusCode: 404,
    });
    expect(mockClinic.findByPk).toHaveBeenCalledWith("missing-clinic", {
      attributes: ["id"],
    });
  });

  it("throws 409 when the clinic is already linked to the profile", async () => {
    mockClinic.findByPk.mockResolvedValue({ id: "clinic-1" });
    mockUserClinic.findOne.mockResolvedValue({ id: "existing-id" } as never);

    const error = await service
      .create({ userId, clinicId: "clinic-1" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Clinic already linked to profile",
      statusCode: 409,
    });
  });

  it("creates the link and re-fetches the created record", async () => {
    mockClinic.findByPk.mockResolvedValue({ id: "clinic-1" });
    mockUserClinic.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(ownedRecord);
    mockUserClinic.create.mockResolvedValue({ id: "user-clinic-1" });

    const result = await service.create({
      userId,
      clinicId: "clinic-1",
      notes: "Primary clinic",
    });

    expect(mockUserClinic.create).toHaveBeenCalledWith({
      userId,
      clinicId: "clinic-1",
      notes: "Primary clinic",
    });
    expect(mockUserClinic.findOne).toHaveBeenCalledTimes(2);
    expect(result).toEqual(ownedRecord);
  });

  it("throws 409 when create fails with a UniqueConstraintError", async () => {
    mockClinic.findByPk.mockResolvedValue({ id: "clinic-1" });
    mockUserClinic.findOne.mockResolvedValue(null);
    mockUserClinic.create.mockRejectedValue(new UniqueConstraintError());

    const error = await service
      .create({ userId, clinicId: "clinic-1" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Clinic already linked to profile",
      statusCode: 409,
    });
  });
});

// ─── update ───────────────────────────────────────────────────────────────────

describe("UserClinicService.update", () => {
  it("throws 404 when the user clinic is not found", async () => {
    mockUserClinic.findOne.mockResolvedValue(null);

    const error = await service
      .update({ userId, id: "missing", notes: "updated" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User clinic not found",
      statusCode: 404,
    });
  });

  it("sets the notes, saves and re-fetches", async () => {
    mockUserClinic.findOne
      .mockResolvedValueOnce(ownedRecord)
      .mockResolvedValueOnce(ownedRecord);

    const result = await service.update({ userId, id: "user-clinic-1", notes: "New notes" });

    expect(ownedRecord.setDataValue).toHaveBeenCalledWith(
      "notes",
      "New notes",
    );
    expect(ownedRecord.save).toHaveBeenCalled();
    expect(mockUserClinic.findOne).toHaveBeenCalledTimes(2);
    expect(result).toEqual(ownedRecord);
  });

  it("skips setDataValue when notes is undefined", async () => {
    mockUserClinic.findOne
      .mockResolvedValueOnce(ownedRecord)
      .mockResolvedValueOnce(ownedRecord);

    await service.update({ userId, id: "user-clinic-1" });

    expect(ownedRecord.setDataValue).not.toHaveBeenCalled();
    expect(ownedRecord.save).toHaveBeenCalled();
  });
});

// ─── remove ───────────────────────────────────────────────────────────────────

describe("UserClinicService.remove", () => {
  it("throws 404 when the user clinic is not found", async () => {
    mockUserClinic.findOne.mockResolvedValue(null);

    const error = await service.remove(userId, "missing").catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User clinic not found",
      statusCode: 404,
    });
  });

  it("soft-deletes the user clinic and returns id with active false", async () => {
    const record = {
      id: "user-clinic-1",
      active: true,
      save: jest.fn().mockResolvedValue(undefined),
    };
    mockUserClinic.findOne.mockResolvedValue(record);

    const result = await service.remove(userId, "user-clinic-1");

    expect(record.active).toBe(false);
    expect(record.save).toHaveBeenCalled();
    expect(result).toEqual({ id: "user-clinic-1", active: false });
  });
});