import { UniqueConstraintError } from "sequelize";
import { Medication, UserMedication } from "../../src/models";
import { UserMedicationService } from "../../src/services/user-medication.service";

jest.mock("../../src/models", () => ({
  Medication: {
    findByPk: jest.fn(),
  },
  UserMedication: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const mockMedication = Medication as jest.Mocked<typeof Medication>;
const mockUserMedication = UserMedication as jest.Mocked<typeof UserMedication>;
const service = new UserMedicationService();

const userId = "00000000-0000-0000-0000-000000000001";
const ownedRecord = {
  id: "user-medication-1",
  userId,
  medicationId: "medication-1",
  dosage: 100,
  dosageMeasurement: "mg",
  frequency: "Twice daily",
  notes: "With food",
  active: true,
  medication: { id: "medication-1", name: "Aspirin" },
  setDataValue: jest.fn(),
  save: jest.fn().mockResolvedValue(undefined),
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── list ─────────────────────────────────────────────────────────────────────

describe("UserMedicationService.list", () => {
  it("returns a paginated list scoped to the user", async () => {
    mockUserMedication.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [ownedRecord],
    });

    const result = await service.list({ userId, currentPage: 1, pageSize: 10 });

    expect(mockUserMedication.findAndCountAll).toHaveBeenCalledWith({
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

describe("UserMedicationService.getById", () => {
  it("returns the user medication when found", async () => {
    mockUserMedication.findOne.mockResolvedValue(ownedRecord);

    const result = await service.getById(userId, "user-medication-1");

    expect(result).toEqual(ownedRecord);
  });

  it("throws 404 when the user medication is not found", async () => {
    mockUserMedication.findOne.mockResolvedValue(null);

    const error = await service
      .getById(userId, "missing")
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User medication not found",
      statusCode: 404,
    });
  });
});

// ─── create ───────────────────────────────────────────────────────────────────

describe("UserMedicationService.create", () => {
  it("throws 404 when the medication does not exist", async () => {
    mockMedication.findByPk.mockResolvedValue(null);

    const error = await service
      .create({ userId, medicationId: "missing-medication" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Medication not found",
      statusCode: 404,
    });
  });

  it("throws 409 when the medication is already linked", async () => {
    mockMedication.findByPk.mockResolvedValue({ id: "medication-1" });
    mockUserMedication.findOne.mockResolvedValue({ id: "existing-id" } as never);

    const error = await service
      .create({ userId, medicationId: "medication-1" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Medication already linked to profile",
      statusCode: 409,
    });
  });

  it("creates the user medication with provided fields and re-fetches", async () => {
    mockMedication.findByPk.mockResolvedValue({ id: "medication-1" });
    mockUserMedication.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(ownedRecord);
    mockUserMedication.create.mockResolvedValue({ id: "user-medication-1" });

    const result = await service.create({
      userId,
      medicationId: "medication-1",
      dosage: 100,
      dosageMeasurement: "mg",
      frequency: "Twice daily",
      notes: "With food",
    });

    expect(mockUserMedication.create).toHaveBeenCalledWith({
      userId,
      medicationId: "medication-1",
      dosage: 100,
      dosageMeasurement: "mg",
      frequency: "Twice daily",
      notes: "With food",
    });
    expect(result).toEqual(ownedRecord);
  });

  it("throws 409 when create fails with a UniqueConstraintError", async () => {
    mockMedication.findByPk.mockResolvedValue({ id: "medication-1" });
    mockUserMedication.findOne.mockResolvedValue(null);
    mockUserMedication.create.mockRejectedValue(new UniqueConstraintError());

    const error = await service
      .create({ userId, medicationId: "medication-1" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Medication already linked to profile",
      statusCode: 409,
    });
  });
});

// ─── update ───────────────────────────────────────────────────────────────────

describe("UserMedicationService.update", () => {
  it("throws 404 when the user medication is not found", async () => {
    mockUserMedication.findOne.mockResolvedValue(null);

    const error = await service
      .update({ userId, id: "missing", notes: "updated" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User medication not found",
      statusCode: 404,
    });
  });

  it("sets provided fields, saves and re-fetches", async () => {
    mockUserMedication.findOne
      .mockResolvedValueOnce(ownedRecord)
      .mockResolvedValueOnce(ownedRecord);

    const result = await service.update({
      userId,
      id: "user-medication-1",
      dosage: 200,
      dosageMeasurement: "tablet",
      frequency: "Once daily",
      notes: "Updated",
    });

    expect(ownedRecord.setDataValue).toHaveBeenCalledWith("dosage", 200);
    expect(ownedRecord.setDataValue).toHaveBeenCalledWith(
      "dosageMeasurement",
      "tablet",
    );
    expect(ownedRecord.setDataValue).toHaveBeenCalledWith("frequency", "Once daily");
    expect(ownedRecord.setDataValue).toHaveBeenCalledWith("notes", "Updated");
    expect(ownedRecord.save).toHaveBeenCalled();
    expect(mockUserMedication.findOne).toHaveBeenCalledTimes(2);
    expect(result).toEqual(ownedRecord);
  });

  it("skips setDataValue when no fields are provided", async () => {
    mockUserMedication.findOne
      .mockResolvedValueOnce(ownedRecord)
      .mockResolvedValueOnce(ownedRecord);

    await service.update({ userId, id: "user-medication-1" });

    expect(ownedRecord.setDataValue).not.toHaveBeenCalled();
    expect(ownedRecord.save).toHaveBeenCalled();
  });
});

// ─── remove ───────────────────────────────────────────────────────────────────

describe("UserMedicationService.remove", () => {
  it("throws 404 when the user medication is not found", async () => {
    mockUserMedication.findOne.mockResolvedValue(null);

    const error = await service.remove(userId, "missing").catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User medication not found",
      statusCode: 404,
    });
  });

  it("soft-deletes the user medication and returns id with active false", async () => {
    const record = {
      id: "user-medication-1",
      active: true,
      save: jest.fn().mockResolvedValue(undefined),
    };
    mockUserMedication.findOne.mockResolvedValue(record);

    const result = await service.remove(userId, "user-medication-1");

    expect(record.active).toBe(false);
    expect(record.save).toHaveBeenCalled();
    expect(result).toEqual({ id: "user-medication-1", active: false });
  });
});