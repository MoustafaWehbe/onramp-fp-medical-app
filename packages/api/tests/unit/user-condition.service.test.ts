import { UniqueConstraintError } from "sequelize";
import { ConditionCatalog, UserCondition } from "../../src/models";
import {
  userConditionService,
  UserConditionService,
} from "../../src/services/user-condition.service";

jest.mock("../../src/models", () => ({
  ConditionCatalog: {
    findByPk: jest.fn(),
  },
  UserCondition: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const mockConditionCatalog = ConditionCatalog as jest.Mocked<typeof ConditionCatalog>;
const mockUserCondition = UserCondition as jest.Mocked<typeof UserCondition>;
const service = new UserConditionService();

const userId = "00000000-0000-0000-0000-000000000001";
const ownedRecord = {
  id: "user-condition-1",
  userId,
  conditionId: "condition-1",
  description: "Seasonal",
  diagnosedDate: "2025-05-01",
  status: "active",
  notes: "On medication",
  active: true,
  condition: { id: "condition-1", name: "Hay fever" },
  setDataValue: jest.fn(),
  save: jest.fn().mockResolvedValue(undefined),
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── list ─────────────────────────────────────────────────────────────────────

describe("UserConditionService.list", () => {
  it("returns a paginated list scoped to the user", async () => {
    mockUserCondition.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [ownedRecord],
    });

    const result = await service.list({ userId, currentPage: 1, pageSize: 10 });

    expect(mockUserCondition.findAndCountAll).toHaveBeenCalledWith({
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

describe("UserConditionService.getById", () => {
  it("returns the user condition when found", async () => {
    mockUserCondition.findOne.mockResolvedValue(ownedRecord);

    const result = await service.getById(userId, "user-condition-1");

    expect(result).toEqual(ownedRecord);
  });

  it("throws 404 when the user condition is not found", async () => {
    mockUserCondition.findOne.mockResolvedValue(null);

    const error = await service
      .getById(userId, "missing")
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User condition not found",
      statusCode: 404,
    });
  });
});

// ─── create ───────────────────────────────────────────────────────────────────

describe("UserConditionService.create", () => {
  it("throws 404 when the condition does not exist", async () => {
    mockConditionCatalog.findByPk.mockResolvedValue(null);

    const error = await service
      .create({ userId, conditionId: "missing-condition" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Condition not found",
      statusCode: 404,
    });
  });

  it("throws 409 when the condition is already linked", async () => {
    mockConditionCatalog.findByPk.mockResolvedValue({ id: "condition-1" });
    mockUserCondition.findOne.mockResolvedValue({ id: "existing-id" } as never);

    const error = await service
      .create({ userId, conditionId: "condition-1" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Condition already linked to profile",
      statusCode: 409,
    });
  });

  it("creates the user condition with provided fields and re-fetches", async () => {
    mockConditionCatalog.findByPk.mockResolvedValue({ id: "condition-1" });
    mockUserCondition.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(ownedRecord);
    mockUserCondition.create.mockResolvedValue({ id: "user-condition-1" });

    const result = await service.create({
      userId,
      conditionId: "condition-1",
      description: "Seasonal",
      diagnosedDate: "2025-05-01",
      status: "active",
      notes: "On medication",
    });

    expect(mockUserCondition.create).toHaveBeenCalledWith({
      userId,
      conditionId: "condition-1",
      description: "Seasonal",
      diagnosedDate: "2025-05-01",
      status: "active",
      notes: "On medication",
    });
    expect(result).toEqual(ownedRecord);
  });

  it("throws 409 when create fails with a UniqueConstraintError", async () => {
    mockConditionCatalog.findByPk.mockResolvedValue({ id: "condition-1" });
    mockUserCondition.findOne.mockResolvedValue(null);
    mockUserCondition.create.mockRejectedValue(new UniqueConstraintError());

    const error = await service
      .create({ userId, conditionId: "condition-1" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Condition already linked to profile",
      statusCode: 409,
    });
  });
});

// ─── update ───────────────────────────────────────────────────────────────────

describe("UserConditionService.update", () => {
  it("throws 404 when the user condition is not found", async () => {
    mockUserCondition.findOne.mockResolvedValue(null);

    const error = await service
      .update({ userId, id: "missing", notes: "updated" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User condition not found",
      statusCode: 404,
    });
  });

  it("sets provided fields, saves and re-fetches", async () => {
    mockUserCondition.findOne
      .mockResolvedValueOnce(ownedRecord)
      .mockResolvedValueOnce(ownedRecord);

    const result = await service.update({
      userId,
      id: "user-condition-1",
      description: "Chronic",
      diagnosedDate: "2026-01-01",
      status: "resolved",
      notes: "Updated",
    });

    expect(ownedRecord.setDataValue).toHaveBeenCalledWith("description", "Chronic");
    expect(ownedRecord.setDataValue).toHaveBeenCalledWith("diagnosedDate", "2026-01-01");
    expect(ownedRecord.setDataValue).toHaveBeenCalledWith("status", "resolved");
    expect(ownedRecord.setDataValue).toHaveBeenCalledWith("notes", "Updated");
    expect(ownedRecord.save).toHaveBeenCalled();
    expect(mockUserCondition.findOne).toHaveBeenCalledTimes(2);
    expect(result).toEqual(ownedRecord);
  });

  it("skips setDataValue when no fields are provided", async () => {
    mockUserCondition.findOne
      .mockResolvedValueOnce(ownedRecord)
      .mockResolvedValueOnce(ownedRecord);

    await service.update({ userId, id: "user-condition-1" });

    expect(ownedRecord.setDataValue).not.toHaveBeenCalled();
    expect(ownedRecord.save).toHaveBeenCalled();
  });
});

// ─── remove ───────────────────────────────────────────────────────────────────

describe("UserConditionService.remove", () => {
  it("throws 404 when the user condition is not found", async () => {
    mockUserCondition.findOne.mockResolvedValue(null);

    const error = await service.remove(userId, "missing").catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User condition not found",
      statusCode: 404,
    });
  });

  it("soft-deletes the user condition and returns id with active false", async () => {
    const record = {
      id: "user-condition-1",
      active: true,
      save: jest.fn().mockResolvedValue(undefined),
    };
    mockUserCondition.findOne.mockResolvedValue(record);

    const result = await service.remove(userId, "user-condition-1");

    expect(record.active).toBe(false);
    expect(record.save).toHaveBeenCalled();
    expect(result).toEqual({ id: "user-condition-1", active: false });
  });
});