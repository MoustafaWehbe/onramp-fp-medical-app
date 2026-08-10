import { UniqueConstraintError } from "sequelize";
import {
  ConditionSymptom,
  UserCondition,
  UserSymptom,
} from "../../src/models";
import { ConditionSymptomService } from "../../src/services/condition-symptom.service";

jest.mock("../../src/models", () => ({
  ConditionCatalog: {},
  SymptomCatalog: {},
  UserCondition: {
    findOne: jest.fn(),
  },
  UserSymptom: {
    findOne: jest.fn(),
  },
  ConditionSymptom: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  },
}));

const mockUserCondition = UserCondition as jest.Mocked<typeof UserCondition>;
const mockUserSymptom = UserSymptom as jest.Mocked<typeof UserSymptom>;
const mockConditionSymptom = ConditionSymptom as jest.Mocked<typeof ConditionSymptom>;
const service = new ConditionSymptomService();

const userId = "00000000-0000-0000-0000-000000000001";
const linkedRecord = {
  id: "link-1",
  userConditionId: "user-condition-1",
  userSymptomId: "user-symptom-1",
  userCondition: {
    id: "user-condition-1",
    status: "active",
    condition: { id: "condition-1", name: "Hay fever" },
  },
  userSymptom: {
    id: "user-symptom-1",
    catalog: { id: "catalog-1", name: "Sneezing", category: "Respiratory" },
  },
  destroy: jest.fn().mockResolvedValue(undefined),
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── listAll ──────────────────────────────────────────────────────────────────

describe("ConditionSymptomService.listAll", () => {
  it("returns a paginated list of all linked symptoms", async () => {
    mockConditionSymptom.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [linkedRecord],
    });

    const result = await service.listAll({ userId, currentPage: 1, pageSize: 10 });

    expect(mockConditionSymptom.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        order: [
          ["createdAt", "DESC"],
          ["id", "ASC"],
        ],
        limit: 10,
        offset: 0,
        distinct: true,
      }),
    );
    expect(result.data).toEqual([linkedRecord]);
  });
});

// ─── list ─────────────────────────────────────────────────────────────────────

describe("ConditionSymptomService.list", () => {
  it("throws 404 when the user condition is not owned", async () => {
    mockUserCondition.findOne.mockResolvedValue(null);

    const error = await service
      .list({ userId, userConditionId: "missing", currentPage: 1, pageSize: 10 })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User condition not found",
      statusCode: 404,
    });
  });

  it("returns paginated symptoms for an owned condition", async () => {
    mockUserCondition.findOne.mockResolvedValue({ id: "user-condition-1" });
    mockConditionSymptom.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [linkedRecord],
    });

    const result = await service.list({
      userId,
      userConditionId: "user-condition-1",
      currentPage: 1,
      pageSize: 10,
    });

    expect(mockConditionSymptom.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userConditionId: "user-condition-1" },
        distinct: true,
      }),
    );
    expect(result.data).toEqual([linkedRecord]);
  });
});

// ─── link ─────────────────────────────────────────────────────────────────────

describe("ConditionSymptomService.link", () => {
  it("throws 404 when the user condition is not owned", async () => {
    mockUserCondition.findOne.mockResolvedValue(null);

    const error = await service
      .link({ userId, userConditionId: "missing", userSymptomId: "user-symptom-1" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User condition not found",
      statusCode: 404,
    });
  });

  it("throws 404 when the user symptom is not owned", async () => {
    mockUserCondition.findOne.mockResolvedValue({ id: "user-condition-1" });
    mockUserSymptom.findOne.mockResolvedValue(null);

    const error = await service
      .link({ userId, userConditionId: "user-condition-1", userSymptomId: "missing" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User symptom not found",
      statusCode: 404,
    });
  });

  it("throws 409 when the symptom is already linked to the condition", async () => {
    mockUserCondition.findOne.mockResolvedValue({ id: "user-condition-1" });
    mockUserSymptom.findOne.mockResolvedValue({ id: "user-symptom-1" });
    mockConditionSymptom.findOne.mockResolvedValue({ id: "existing-id" } as never);

    const error = await service
      .link({ userId, userConditionId: "user-condition-1", userSymptomId: "user-symptom-1" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Symptom already linked to condition",
      statusCode: 409,
    });
  });

  it("creates the link and re-fetches it", async () => {
    mockUserCondition.findOne.mockResolvedValue({ id: "user-condition-1" });
    mockUserSymptom.findOne.mockResolvedValue({ id: "user-symptom-1" });
    mockConditionSymptom.findOne.mockResolvedValue(null);
    mockConditionSymptom.create.mockResolvedValue({ id: "link-1" });
    mockConditionSymptom.findByPk.mockResolvedValue(linkedRecord);

    const result = await service.link({
      userId,
      userConditionId: "user-condition-1",
      userSymptomId: "user-symptom-1",
    });

    expect(mockConditionSymptom.create).toHaveBeenCalledWith({
      userConditionId: "user-condition-1",
      userSymptomId: "user-symptom-1",
    });
    expect(mockConditionSymptom.findByPk).toHaveBeenCalledWith(
      "link-1",
      expect.objectContaining({ include: expect.any(Array) }),
    );
    expect(result).toEqual(linkedRecord);
  });

  it("throws 409 when create fails with a UniqueConstraintError", async () => {
    mockUserCondition.findOne.mockResolvedValue({ id: "user-condition-1" });
    mockUserSymptom.findOne.mockResolvedValue({ id: "user-symptom-1" });
    mockConditionSymptom.findOne.mockResolvedValue(null);
    mockConditionSymptom.create.mockRejectedValue(new UniqueConstraintError());

    const error = await service
      .link({ userId, userConditionId: "user-condition-1", userSymptomId: "user-symptom-1" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Symptom already linked to condition",
      statusCode: 409,
    });
  });
});

// ─── unlink ───────────────────────────────────────────────────────────────────

describe("ConditionSymptomService.unlink", () => {
  it("throws 404 when the user condition is not owned", async () => {
    mockUserCondition.findOne.mockResolvedValue(null);

    const error = await service
      .unlink(userId, "missing", "user-symptom-1")
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User condition not found",
      statusCode: 404,
    });
  });

  it("throws 404 when the link is not found", async () => {
    mockUserCondition.findOne.mockResolvedValue({ id: "user-condition-1" });
    mockConditionSymptom.findOne.mockResolvedValue(null);

    const error = await service
      .unlink(userId, "user-condition-1", "user-symptom-1")
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Condition symptom link not found",
      statusCode: 404,
    });
  });

  it("destroys the link and returns an unlinked message", async () => {
    mockUserCondition.findOne.mockResolvedValue({ id: "user-condition-1" });
    mockConditionSymptom.findOne.mockResolvedValue(linkedRecord);

    const result = await service.unlink(userId, "user-condition-1", "user-symptom-1");

    expect(linkedRecord.destroy).toHaveBeenCalled();
    expect(result).toEqual({ message: "Unlinked" });
  });
});