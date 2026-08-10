import { UniqueConstraintError } from "sequelize";
import { Doctor, UserClinic, UserDoctor } from "../../src/models";
import {
  userDoctorService,
  UserDoctorService,
} from "../../src/services/user-doctor.service";

jest.mock("../../src/models", () => ({
  Doctor: {
    findByPk: jest.fn(),
  },
  UserClinic: {
    findOne: jest.fn(),
  },
  UserDoctor: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const mockDoctor = Doctor as jest.Mocked<typeof Doctor>;
const mockUserClinic = UserClinic as jest.Mocked<typeof UserClinic>;
const mockUserDoctor = UserDoctor as jest.Mocked<typeof UserDoctor>;
const service = new UserDoctorService();

const userId = "00000000-0000-0000-0000-000000000001";
const ownedRecord = {
  id: "user-doctor-1",
  userId,
  doctorId: "doctor-1",
  userClinicId: "user-clinic-1",
  notes: "Primary physician",
  active: true,
  doctor: { id: "doctor-1", name: "Jane Doe", specialty: "Cardiology" },
  userClinic: { id: "user-clinic-1", clinicId: "clinic-1", notes: null },
  setDataValue: jest.fn(),
  save: jest.fn().mockResolvedValue(undefined),
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── list ─────────────────────────────────────────────────────────────────────

describe("UserDoctorService.list", () => {
  it("returns a paginated list scoped to the user", async () => {
    mockUserDoctor.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [ownedRecord],
    });

    const result = await service.list({ userId, currentPage: 1, pageSize: 10 });

    expect(mockUserDoctor.findAndCountAll).toHaveBeenCalledWith({
      where: { userId },
      include: [expect.any(Object), expect.any(Object)],
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

describe("UserDoctorService.getById", () => {
  it("returns the user doctor when found", async () => {
    mockUserDoctor.findOne.mockResolvedValue(ownedRecord);

    const result = await service.getById(userId, "user-doctor-1");

    expect(result).toEqual(ownedRecord);
  });

  it("throws 404 when the user doctor is not found", async () => {
    mockUserDoctor.findOne.mockResolvedValue(null);

    const error = await service.getById(userId, "missing").catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User doctor not found",
      statusCode: 404,
    });
  });
});

// ─── create ───────────────────────────────────────────────────────────────────

describe("UserDoctorService.create", () => {
  it("throws 404 when the doctor does not exist", async () => {
    mockDoctor.findByPk.mockResolvedValue(null);

    const error = await service
      .create({ userId, doctorId: "missing-doctor" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Doctor not found",
      statusCode: 404,
    });
  });

  it("throws 404 when the user clinic is not owned by the user", async () => {
    mockDoctor.findByPk.mockResolvedValue({ id: "doctor-1" });
    mockUserClinic.findOne.mockResolvedValue(null);

    const error = await service
      .create({ userId, doctorId: "doctor-1", userClinicId: "user-clinic-1" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User clinic not found",
      statusCode: 404,
    });
    expect(mockUserClinic.findOne).toHaveBeenCalledWith({
      where: { id: "user-clinic-1", userId },
      attributes: ["id"],
    });
  });

  it("throws 409 when the doctor is already linked", async () => {
    mockDoctor.findByPk.mockResolvedValue({ id: "doctor-1" });
    mockUserDoctor.findOne.mockResolvedValue({ id: "existing-id" } as never);

    const error = await service
      .create({ userId, doctorId: "doctor-1" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Doctor already linked to profile",
      statusCode: 409,
    });
  });

  it("creates the user doctor with provided fields and re-fetches", async () => {
    mockDoctor.findByPk.mockResolvedValue({ id: "doctor-1" });
    mockUserClinic.findOne.mockResolvedValue({ id: "user-clinic-1" });
    mockUserDoctor.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(ownedRecord);
    mockUserDoctor.create.mockResolvedValue({ id: "user-doctor-1" });

    const result = await service.create({
      userId,
      doctorId: "doctor-1",
      userClinicId: "user-clinic-1",
      notes: "Primary physician",
    });

    expect(mockUserDoctor.create).toHaveBeenCalledWith({
      userId,
      doctorId: "doctor-1",
      userClinicId: "user-clinic-1",
      notes: "Primary physician",
    });
    expect(result).toEqual(ownedRecord);
  });

  it("throws 409 when create fails with a UniqueConstraintError", async () => {
    mockDoctor.findByPk.mockResolvedValue({ id: "doctor-1" });
    mockUserDoctor.findOne.mockResolvedValue(null);
    mockUserDoctor.create.mockRejectedValue(new UniqueConstraintError());

    const error = await service
      .create({ userId, doctorId: "doctor-1" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Doctor already linked to profile",
      statusCode: 409,
    });
  });
});

// ─── update ───────────────────────────────────────────────────────────────────

describe("UserDoctorService.update", () => {
  it("throws 404 when the user doctor is not found", async () => {
    mockUserDoctor.findOne.mockResolvedValue(null);

    const error = await service
      .update({ userId, id: "missing", notes: "updated" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User doctor not found",
      statusCode: 404,
    });
  });

  it("sets userClinicId and notes, saves and re-fetches", async () => {
    mockUserClinic.findOne.mockResolvedValue({ id: "user-clinic-2" });
    mockUserDoctor.findOne
      .mockResolvedValueOnce(ownedRecord)
      .mockResolvedValueOnce(ownedRecord);

    const result = await service.update({
      userId,
      id: "user-doctor-1",
      userClinicId: "user-clinic-2",
      notes: "Updated notes",
    });

    expect(mockUserClinic.findOne).toHaveBeenCalledWith({
      where: { id: "user-clinic-2", userId },
      attributes: ["id"],
    });
    expect(ownedRecord.setDataValue).toHaveBeenCalledWith(
      "userClinicId",
      "user-clinic-2",
    );
    expect(ownedRecord.setDataValue).toHaveBeenCalledWith("notes", "Updated notes");
    expect(ownedRecord.save).toHaveBeenCalled();
    expect(mockUserDoctor.findOne).toHaveBeenCalledTimes(2);
    expect(result).toEqual(ownedRecord);
  });

  it("skips ownership check and setDataValue when only notes are undefined", async () => {
    mockUserDoctor.findOne
      .mockResolvedValueOnce(ownedRecord)
      .mockResolvedValueOnce(ownedRecord);

    await service.update({ userId, id: "user-doctor-1" });

    expect(mockUserClinic.findOne).not.toHaveBeenCalled();
    expect(ownedRecord.setDataValue).not.toHaveBeenCalled();
    expect(ownedRecord.save).toHaveBeenCalled();
  });
});

// ─── remove ───────────────────────────────────────────────────────────────────

describe("UserDoctorService.remove", () => {
  it("throws 404 when the user doctor is not found", async () => {
    mockUserDoctor.findOne.mockResolvedValue(null);

    const error = await service.remove(userId, "missing").catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User doctor not found",
      statusCode: 404,
    });
  });

  it("soft-deletes the user doctor and returns id with active false", async () => {
    const record = {
      id: "user-doctor-1",
      active: true,
      save: jest.fn().mockResolvedValue(undefined),
    };
    mockUserDoctor.findOne.mockResolvedValue(record);

    const result = await service.remove(userId, "user-doctor-1");

    expect(record.active).toBe(false);
    expect(record.save).toHaveBeenCalled();
    expect(result).toEqual({ id: "user-doctor-1", active: false });
  });
});