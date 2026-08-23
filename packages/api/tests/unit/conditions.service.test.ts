import { Op, UniqueConstraintError } from "sequelize";
import { ConditionCatalog } from "src/models/catalogs/ConditionCatalog";
import { searchConditionsFromApi } from "../../src/lib/catalog-condition-api";
import { ConditionService } from "../../src/services/conditions.service";

jest.mock("../../src/models/catalogs/ConditionCatalog", () => ({
  ConditionCatalog: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../../src/lib/catalog-condition-api", () => ({
  searchConditionsFromApi: jest.fn(),
}));

const mockConditionCatalog = ConditionCatalog as jest.Mocked<typeof ConditionCatalog>;
const mockSearchConditions = searchConditionsFromApi as jest.MockedFunction<
  typeof searchConditionsFromApi
>;
const service = new ConditionService();

const conditionRow = {
  id: "50000000-0000-0000-0000-000000000031",
  name: "Influenza",
  createdAt: new Date("2026-01-10T00:00:00Z"),
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── list ─────────────────────────────────────────────────────────────────────

describe("ConditionService.list", () => {
  it("returns a paginated list using default pagination", async () => {
    mockConditionCatalog.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [conditionRow],
    });

    const result = await service.list({ currentPage: 1, pageSize: 10 });

    expect(mockConditionCatalog.findAndCountAll).toHaveBeenCalledWith({
      attributes: ["id", "name", "nameAr", "createdAt"],
      where: undefined,
      order: [["name", "ASC"]],
      limit: 10,
      offset: 0,
    });
    expect(result.data).toEqual([conditionRow]);
  });

  it("passes a search where clause when search is provided", async () => {
    mockConditionCatalog.findAndCountAll.mockResolvedValue({
      count: 0,
      rows: [],
    });

    await service.list({ currentPage: 1, pageSize: 5, search: "flu" });

    expect(mockConditionCatalog.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { [Op.or]: [{ name: { [Op.iLike]: "%flu%" } }] },
        limit: 5,
        offset: 0,
      }),
    );
  });
});

// ─── getById ──────────────────────────────────────────────────────────────────

describe("ConditionService.getById", () => {
  it("returns the condition when found", async () => {
    mockConditionCatalog.findByPk.mockResolvedValue(conditionRow);

    const result = await service.getById("condition-id");

    expect(mockConditionCatalog.findByPk).toHaveBeenCalledWith("condition-id", {
      attributes: ["id", "name", "nameAr", "createdAt", "updatedAt"],
    });
    expect(result).toEqual(conditionRow);
  });

  it("throws 404 when the condition is not found", async () => {
    mockConditionCatalog.findByPk.mockResolvedValue(null);

    const error = await service.getById("missing-id").catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Condition not found",
      statusCode: 404,
    });
  });
});

// ─── create ──────────────────────────────────────────────────────────────────

describe("ConditionService.create", () => {
  it("trims the name and creates the condition", async () => {
    mockConditionCatalog.findOne.mockResolvedValue(null);
    mockConditionCatalog.create.mockResolvedValue({ ...conditionRow, name: "Flu" });

    const result = await service.create({ name: "  Flu  " });

    expect(mockConditionCatalog.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ attributes: ["id"] }),
    );
    expect(mockConditionCatalog.create).toHaveBeenCalledWith({ name: "Flu" });
    expect(result.name).toBe("Flu");
  });

  it("throws 422 when the trimmed name is empty", async () => {
    const error = await service.create({ name: "   " }).catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Name is required",
      statusCode: 422,
    });
    expect(mockConditionCatalog.findOne).not.toHaveBeenCalled();
  });

  it("throws 409 when a duplicate condition exists", async () => {
    mockConditionCatalog.findOne.mockResolvedValue({ id: "existing-id" } as never);

    const error = await service.create({ name: "Flu" }).catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Condition already exists",
      statusCode: 409,
    });
    expect(mockConditionCatalog.create).not.toHaveBeenCalled();
  });

  it("throws 409 when create fails with a UniqueConstraintError", async () => {
    mockConditionCatalog.findOne.mockResolvedValue(null);
    mockConditionCatalog.create.mockRejectedValue(new UniqueConstraintError());

    const error = await service.create({ name: "Flu" }).catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Condition already exists",
      statusCode: 409,
    });
  });
});

// ─── searchConditions ─────────────────────────────────────────────────────────

describe("ConditionService.searchConditions", () => {
  it("returns an empty array when no term is provided", async () => {
    const result = await service.searchConditions(undefined);

    expect(result).toEqual([]);
    expect(mockSearchConditions).not.toHaveBeenCalled();
  });

  it("delegates to the condition API library when a term is provided", async () => {
    mockSearchConditions.mockResolvedValue(["Flu", "Common cold"]);

    const result = await service.searchConditions("flu");

    expect(mockSearchConditions).toHaveBeenCalledWith("flu");
    expect(result).toEqual(["Flu", "Common cold"]);
  });
});