import { Op, UniqueConstraintError } from "sequelize";
import { Medication } from "../../src/models";
import { searchMedicationNames } from "../../src/lib/medication-search";
import { lookupMedicationCategory } from "../../src/lib/medication-category";
import { MedicationService } from "../../src/services/medication.service";

jest.mock("../../src/models", () => ({
  Medication: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../../src/lib/medication-search", () => ({
  searchMedicationNames: jest.fn(),
}));

jest.mock("../../src/lib/medication-category", () => ({
  lookupMedicationCategory: jest.fn(),
}));

const mockMedication = Medication as jest.Mocked<typeof Medication>;
const mockSearchNames = searchMedicationNames as jest.MockedFunction<
  typeof searchMedicationNames
>;
const mockLookupCategory = lookupMedicationCategory as jest.MockedFunction<
  typeof lookupMedicationCategory
>;
const service = new MedicationService();

const medicationRow = {
  id: "50000000-0000-0000-0000-000000000041",
  name: "Aspirin",
  strength: "81mg",
  category: "Painkiller",
  createdAt: new Date("2026-01-10T00:00:00Z"),
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── list ─────────────────────────────────────────────────────────────────────

describe("MedicationService.list", () => {
  it("returns a paginated list using default pagination", async () => {
    mockMedication.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [medicationRow],
    });

    const result = await service.list({ currentPage: 1, pageSize: 10 });

    expect(mockMedication.findAndCountAll).toHaveBeenCalledWith({
      attributes: ["id", "name", "strength", "category", "createdAt"],
      where: undefined,
      order: [
        ["name", "ASC"],
        ["strength", "ASC"],
      ],
      limit: 10,
      offset: 0,
    });
    expect(result.data).toEqual([medicationRow]);
  });

  it("passes a search where clause when search is provided", async () => {
    mockMedication.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await service.list({ currentPage: 1, pageSize: 5, search: "aspirin" });

    expect(mockMedication.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: "%aspirin%" } },
            { strength: { [Op.iLike]: "%aspirin%" } },
            { category: { [Op.iLike]: "%aspirin%" } },
          ],
        },
        limit: 5,
        offset: 0,
      }),
    );
  });
});

// ─── getById ──────────────────────────────────────────────────────────────────

describe("MedicationService.getById", () => {
  it("returns the medication when found", async () => {
    mockMedication.findByPk.mockResolvedValue(medicationRow);

    const result = await service.getById("medication-id");

    expect(mockMedication.findByPk).toHaveBeenCalledWith("medication-id", {
      attributes: [
        "id",
        "name",
        "strength",
        "category",
        "createdAt",
        "updatedAt",
      ],
    });
    expect(result).toEqual(medicationRow);
  });

  it("throws 404 when the medication is not found", async () => {
    mockMedication.findByPk.mockResolvedValue(null);

    const error = await service.getById("missing-id").catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Medication not found",
      statusCode: 404,
    });
  });
});

// ─── create ──────────────────────────────────────────────────────────────────

describe("MedicationService.create", () => {
  it("checks duplicates by name and strength when strength is provided", async () => {
    mockMedication.findOne.mockResolvedValue(null);
    mockMedication.create.mockResolvedValue(medicationRow);

    await service.create({ name: "Aspirin", strength: "81mg" });

    expect(mockMedication.findOne).toHaveBeenCalledWith({
      where: { name: "Aspirin", strength: "81mg" },
    });
    expect(mockMedication.create).toHaveBeenCalledWith({
      name: "Aspirin",
      strength: "81mg",
    });
  });

  it("checks duplicates by name and IS NULL strength when strength is omitted", async () => {
    mockMedication.findOne.mockResolvedValue(null);
    mockMedication.create.mockResolvedValue(medicationRow);

    await service.create({ name: "Aspirin" });

    expect(mockMedication.findOne).toHaveBeenCalledWith({
      where: { name: "Aspirin", strength: { [Op.is]: null } },
    });
  });

  it("throws 409 when a duplicate medication exists", async () => {
    mockMedication.findOne.mockResolvedValue({ id: "existing-id" } as never);

    const error = await service
      .create({ name: "Aspirin", strength: "81mg" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Medication already exists",
      statusCode: 409,
    });
    expect(mockMedication.create).not.toHaveBeenCalled();
  });

  it("throws 409 when create fails with a UniqueConstraintError", async () => {
    mockMedication.findOne.mockResolvedValue(null);
    mockMedication.create.mockRejectedValue(new UniqueConstraintError());

    const error = await service
      .create({ name: "Aspirin" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Medication already exists",
      statusCode: 409,
    });
  });
});

// ─── searchNames ──────────────────────────────────────────────────────────────

describe("MedicationService.searchNames", () => {
  it("returns the names resolved from the search library", async () => {
    mockSearchNames.mockResolvedValue(["Aspirin", "Aspirin 81mg"]);

    const result = await service.searchNames("aspirin");

    expect(mockSearchNames).toHaveBeenCalledWith("aspirin");
    expect(result).toEqual(["Aspirin", "Aspirin 81mg"]);
  });

  it("throws 502 when the search library rejects", async () => {
    mockSearchNames.mockRejectedValue(new Error("api down"));

    const error = await service.searchNames("aspirin").catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Failed to search medications",
      statusCode: 502,
    });
  });
});

// ─── lookupCategoryOnline ─────────────────────────────────────────────────────

describe("MedicationService.lookupCategoryOnline", () => {
  it("returns the category string from the lookup library", async () => {
    mockLookupCategory.mockResolvedValue("Painkiller");

    const result = await service.lookupCategoryOnline("Aspirin");

    expect(mockLookupCategory).toHaveBeenCalledWith("Aspirin");
    expect(result).toBe("Painkiller");
  });

  it("returns null when the lookup library returns null", async () => {
    mockLookupCategory.mockResolvedValue(null);

    const result = await service.lookupCategoryOnline("Unknown");

    expect(result).toBeNull();
  });

  it("throws 502 when the lookup library rejects", async () => {
    mockLookupCategory.mockRejectedValue(new Error("api down"));

    const error = await service
      .lookupCategoryOnline("Aspirin")
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Failed to lookup medication category",
      statusCode: 502,
    });
  });
});