import { UniqueConstraintError } from "sequelize";
import { SymptomCatalog, UserSymptom } from "../../src/models";
import {
  userSymptomService,
  UserSymptomService,
} from "../../src/services/user-symptom.service";

jest.mock("../../src/models", () => ({
  SymptomCatalog: {
    findByPk: jest.fn(),
  },
  UserSymptom: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const mockSymptomCatalog = SymptomCatalog as jest.Mocked<typeof SymptomCatalog>;
const mockUserSymptom = UserSymptom as jest.Mocked<typeof UserSymptom>;
const service = new UserSymptomService();

const userId = "00000000-0000-0000-0000-000000000001";
const ownedRecord = {
  id: "user-symptom-1",
  userId,
  catalogId: "catalog-1",
  active: true,
  catalog: { id: "catalog-1", name: "Headache", category: "Neurological" },
  save: jest.fn().mockResolvedValue(undefined),
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── list ─────────────────────────────────────────────────────────────────────

describe("UserSymptomService.list", () => {
  it("returns a paginated list scoped to the user", async () => {
    mockUserSymptom.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [ownedRecord],
    });

    const result = await service.list({ userId, currentPage: 1, pageSize: 10 });

    expect(mockUserSymptom.findAndCountAll).toHaveBeenCalledWith({
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

// ─── create ───────────────────────────────────────────────────────────────────

describe("UserSymptomService.create", () => {
  it("throws 404 when the catalog entry does not exist", async () => {
    mockSymptomCatalog.findByPk.mockResolvedValue(null);

    const error = await service
      .create({ userId, catalogId: "missing-catalog" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Symptom catalog entry not found",
      statusCode: 404,
    });
  });

  it("throws 409 when the symptom is already linked", async () => {
    mockSymptomCatalog.findByPk.mockResolvedValue({ id: "catalog-1" });
    mockUserSymptom.findOne.mockResolvedValue({ id: "existing-id" } as never);

    const error = await service
      .create({ userId, catalogId: "catalog-1" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Symptom already linked to profile",
      statusCode: 409,
    });
  });

  it("creates the user symptom and re-fetches", async () => {
    mockSymptomCatalog.findByPk.mockResolvedValue({ id: "catalog-1" });
    mockUserSymptom.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(ownedRecord);
    mockUserSymptom.create.mockResolvedValue({ id: "user-symptom-1" });

    const result = await service.create({ userId, catalogId: "catalog-1" });

    expect(mockUserSymptom.create).toHaveBeenCalledWith({
      userId,
      catalogId: "catalog-1",
    });
    expect(result).toEqual(ownedRecord);
  });

  it("throws 409 when create fails with a UniqueConstraintError", async () => {
    mockSymptomCatalog.findByPk.mockResolvedValue({ id: "catalog-1" });
    mockUserSymptom.findOne.mockResolvedValue(null);
    mockUserSymptom.create.mockRejectedValue(new UniqueConstraintError());

    const error = await service
      .create({ userId, catalogId: "catalog-1" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Symptom already linked to profile",
      statusCode: 409,
    });
  });
});

// ─── getById ──────────────────────────────────────────────────────────────────

describe("UserSymptomService.getById", () => {
  it("returns the user symptom when found", async () => {
    mockUserSymptom.findOne.mockResolvedValue(ownedRecord);

    const result = await service.getById(userId, "user-symptom-1");

    expect(result).toEqual(ownedRecord);
  });

  it("throws 404 when the user symptom is not found", async () => {
    mockUserSymptom.findOne.mockResolvedValue(null);

    const error = await service.getById(userId, "missing").catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User symptom not found",
      statusCode: 404,
    });
  });
});

// ─── remove ───────────────────────────────────────────────────────────────────

describe("UserSymptomService.remove", () => {
  it("throws 404 when the user symptom is not found", async () => {
    mockUserSymptom.findOne.mockResolvedValue(null);

    const error = await service.remove(userId, "missing").catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User symptom not found",
      statusCode: 404,
    });
  });

  it("soft-deletes the user symptom and returns id with active false", async () => {
    const record = {
      id: "user-symptom-1",
      active: true,
      save: jest.fn().mockResolvedValue(undefined),
    };
    mockUserSymptom.findOne.mockResolvedValue(record);

    const result = await service.remove(userId, "user-symptom-1");

    expect(record.active).toBe(false);
    expect(record.save).toHaveBeenCalled();
    expect(result).toEqual({ id: "user-symptom-1", active: false });
  });
});