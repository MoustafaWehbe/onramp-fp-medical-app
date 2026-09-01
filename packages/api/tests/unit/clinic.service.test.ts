import { Op, UniqueConstraintError } from "sequelize";
import { Clinic } from "../../src/models";
import { ClinicService } from "../../src/services/clinic.service";

jest.mock("../../src/models", () => ({
  Clinic: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const mockClinic = Clinic as jest.Mocked<typeof Clinic>;
const service = new ClinicService();

const clinicRow = {
  id: "50000000-0000-0000-0000-000000000001",
  name: "City Medical Center",
  address: "123 Main St",
  phone: "+1234567890",
  createdAt: new Date("2026-01-10T00:00:00Z"),
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── list ─────────────────────────────────────────────────────────────────────

describe("ClinicService.list", () => {
  it("returns a paginated list using default pagination", async () => {
    mockClinic.findAndCountAll.mockResolvedValue({
      count: 2,
      rows: [clinicRow],
    });

    const result = await service.list({ currentPage: 1, pageSize: 10 });

    expect(mockClinic.findAndCountAll).toHaveBeenCalledWith({
      attributes: ["id", "name", "address", "phone", "createdAt"],
      order: [
  ["name", "ASC"],
  ["id", "ASC"],
],
where: {},
      limit: 10,
      offset: 0,
    });
    expect(result.data).toEqual([clinicRow]);
    expect(result.pagination.totalCount).toBe(2);
    expect(result.pagination.totalPages).toBe(1);
  });

  it("passes a search where clause when search is provided", async () => {
    mockClinic.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await service.list({ currentPage: 2, pageSize: 5, search: " medical " });

    expect(mockClinic.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
           [Op.and]: [
            {
          [Op.or]: [
            { name: { [Op.iLike]: "%medical%" } },
            { address: { [Op.iLike]: "%medical%" } },
            { phone: { [Op.iLike]: "%medical%" } },
          ],
        },
      ],
        },
        limit: 5,
        offset: 5,
      }),
    );
  });
});

// ─── create ──────────────────────────────────────────────────────────────────

describe("ClinicService.create", () => {
  it("creates a clinic when no duplicate exists", async () => {
    mockClinic.findOne.mockResolvedValue(null);
    mockClinic.create.mockResolvedValue(clinicRow);

    const result = await service.create({
      name: "City Medical Center",
      address: "123 Main St",
      phone: "+1234567890",
    });

    expect(mockClinic.findOne).toHaveBeenCalledWith({
      where: {
        name: "City Medical Center",
        phone: "+1234567890",
      },
    });
    expect(mockClinic.create).toHaveBeenCalledWith({
      name: "City Medical Center",
      address: "123 Main St",
      phone: "+1234567890",
    });
    expect(result).toEqual(clinicRow);
  });

  it("throws 409 when a duplicate clinic is found", async () => {
    mockClinic.findOne.mockResolvedValue({ id: "existing-id" } as never);

    const error = await service
      .create({
        name: "City Medical Center",
        address: "123 Main St",
        phone: "+1234567890",
      })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Clinic already exists",
      statusCode: 409,
    });
    expect(mockClinic.create).not.toHaveBeenCalled();
  });

  it("throws 409 when create fails with a UniqueConstraintError", async () => {
    mockClinic.findOne.mockResolvedValue(null);
    mockClinic.create.mockRejectedValue(new UniqueConstraintError());

    const error = await service
      .create({
        name: "City Medical Center",
        address: "123 Main St",
        phone: "+1234567890",
      })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Clinic already exists",
      statusCode: 409,
    });
  });

  it("rethrows non-unique errors", async () => {
    mockClinic.findOne.mockResolvedValue(null);
    mockClinic.create.mockRejectedValue(new Error("boom"));

    const error = await service
      .create({
        name: "City Medical Center",
        address: "123 Main St",
        phone: "+1234567890",
      })
      .catch((e: unknown) => e);

    expect((error as Error).message).toBe("boom");
  });
});