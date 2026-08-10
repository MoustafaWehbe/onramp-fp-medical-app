import { Op, UniqueConstraintError } from "sequelize";
import { SymptomCatalog } from "../../src/models";
import { searchSymptomsFromApi } from "../../src/lib/symptoms";
import { SymptomCatalogService } from "../../src/services/symptom.service";

jest.mock("../../src/models", () => ({
  SymptomCatalog: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../../src/lib/symptoms", () => ({
  searchSymptomsFromApi: jest.fn(),
}));

const mockSymptomCatalog = SymptomCatalog as jest.Mocked<typeof SymptomCatalog>;
const mockSearchSymptoms = searchSymptomsFromApi as jest.MockedFunction<
  typeof searchSymptomsFromApi
>;
const service = new SymptomCatalogService();

const symptomRow = {
  id: "50000000-0000-0000-0000-000000000021",
  name: "Headache",
  category: "Neurological",
  createdAt: new Date("2026-01-10T00:00:00Z"),
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── list ─────────────────────────────────────────────────────────────────────

describe("SymptomCatalogService.list", () => {
  it("returns a paginated list using default pagination", async () => {
    mockSymptomCatalog.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [symptomRow],
    });

    const result = await service.list({ currentPage: 1, pageSize: 10 });

    expect(mockSymptomCatalog.findAndCountAll).toHaveBeenCalledWith({
      attributes: ["id", "name", "category", "createdAt"],
      where: undefined,
      order: [["name", "ASC"]],
      limit: 10,
      offset: 0,
    });
    expect(result.data).toEqual([symptomRow]);
  });

  it("passes a search where clause when search is provided", async () => {
    mockSymptomCatalog.findAndCountAll.mockResolvedValue({
      count: 0,
      rows: [],
    });

    await service.list({ currentPage: 1, pageSize: 5, search: "head" });

    expect(mockSymptomCatalog.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: "%head%" } },
            { category: { [Op.iLike]: "%head%" } },
          ],
        },
        limit: 5,
        offset: 0,
      }),
    );
  });
});

// ─── create ──────────────────────────────────────────────────────────────────

describe("SymptomCatalogService.create", () => {
  it("creates a catalog symptom when no duplicate name exists", async () => {
    mockSymptomCatalog.findOne.mockResolvedValue(null);
    mockSymptomCatalog.create.mockResolvedValue(symptomRow);

    const result = await service.create({
      name: "Headache",
      category: "Neurological",
    });

    expect(mockSymptomCatalog.findOne).toHaveBeenCalledWith({
      where: { name: "Headache" },
    });
    expect(mockSymptomCatalog.create).toHaveBeenCalledWith({
      name: "Headache",
      category: "Neurological",
    });
    expect(result).toEqual(symptomRow);
  });

  it("throws 409 when a duplicate symptom exists", async () => {
    mockSymptomCatalog.findOne.mockResolvedValue({ id: "existing-id" } as never);

    const error = await service
      .create({ name: "Headache", category: "Neurological" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Symptom already exists",
      statusCode: 409,
    });
    expect(mockSymptomCatalog.create).not.toHaveBeenCalled();
  });

  it("throws 409 when create fails with a UniqueConstraintError", async () => {
    mockSymptomCatalog.findOne.mockResolvedValue(null);
    mockSymptomCatalog.create.mockRejectedValue(new UniqueConstraintError());

    const error = await service
      .create({ name: "Headache" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Symptom already exists",
      statusCode: 409,
    });
  });
});

// ─── searchSymptomsOnline ─────────────────────────────────────────────────────

describe("SymptomCatalogService.searchSymptomsOnline", () => {
  it("returns the names resolved from the API library", async () => {
    mockSearchSymptoms.mockResolvedValue(["Fever", "Chills"]);

    const result = await service.searchSymptomsOnline("fever");

    expect(mockSearchSymptoms).toHaveBeenCalledWith("fever");
    expect(result).toEqual(["Fever", "Chills"]);
  });

  it("throws 502 when the API library rejects", async () => {
    mockSearchSymptoms.mockRejectedValue(new Error("api down"));

    const error = await service
      .searchSymptomsOnline("fever")
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Failed to search symptoms",
      statusCode: 502,
    });
  });
});