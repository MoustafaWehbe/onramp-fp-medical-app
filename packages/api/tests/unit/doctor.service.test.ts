import { Op, UniqueConstraintError } from "sequelize";
import { Doctor } from "../../src/models";
import { DoctorService } from "../../src/services/doctor.service";

jest.mock("../../src/models", () => ({
  Doctor: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const mockDoctor = Doctor as jest.Mocked<typeof Doctor>;
const service = new DoctorService();

const doctorRow = {
  id: "50000000-0000-0000-0000-000000000011",
  name: "Jane Doe",
  specialty: "Cardiology",
  phone: "+1234567890",
  createdAt: new Date("2026-01-10T00:00:00Z"),
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── list ─────────────────────────────────────────────────────────────────────

describe("DoctorService.list", () => {
  it("returns a paginated list using default pagination", async () => {
    mockDoctor.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [doctorRow],
    });

    const result = await service.list({ currentPage: 1, pageSize: 10 });

    expect(mockDoctor.findAndCountAll).toHaveBeenCalledWith({
      attributes: ["id", "name", "specialty", "phone", "createdAt"],
      where: undefined,
      order: [
        ["name", "ASC"],
        ["createdAt", "DESC"],
        ["id", "ASC"],
      ],
      limit: 10,
      offset: 0,
    });
    expect(result.data).toEqual([doctorRow]);
  });

  it("passes a search where clause when search is provided", async () => {
    mockDoctor.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await service.list({ currentPage: 1, pageSize: 5, search: "cardio" });

    expect(mockDoctor.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: "%cardio%" } },
            { specialty: { [Op.iLike]: "%cardio%" } },
            { phone: { [Op.iLike]: "%cardio%" } },
          ],
        },
        limit: 5,
        offset: 0,
      }),
    );
  });
});

// ─── create ──────────────────────────────────────────────────────────────────

describe("DoctorService.create", () => {
  it("creates a doctor when no duplicate phone exists", async () => {
    mockDoctor.findOne.mockResolvedValue(null);
    mockDoctor.create.mockResolvedValue(doctorRow);

    const result = await service.create({
      name: "Jane Doe",
      specialty: "Cardiology",
      phone: "+1234567890",
    });

    expect(mockDoctor.findOne).toHaveBeenCalledWith({
      where: { phone: "+1234567890" },
    });
    expect(mockDoctor.create).toHaveBeenCalledWith({
      name: "Jane Doe",
      specialty: "Cardiology",
      phone: "+1234567890",
    });
    expect(result).toEqual(doctorRow);
  });

  it("throws 409 when a doctor with the same phone exists", async () => {
    mockDoctor.findOne.mockResolvedValue({ id: "existing-id" } as never);

    const error = await service
      .create({
        name: "Jane Doe",
        specialty: "Cardiology",
        phone: "+1234567890",
      })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Doctor already exists",
      statusCode: 409,
    });
    expect(mockDoctor.create).not.toHaveBeenCalled();
  });

  it("throws 409 when create fails with a UniqueConstraintError", async () => {
    mockDoctor.findOne.mockResolvedValue(null);
    mockDoctor.create.mockRejectedValue(new UniqueConstraintError());

    const error = await service
      .create({
        name: "Jane Doe",
        specialty: "Cardiology",
        phone: "+1234567890",
      })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Doctor already exists",
      statusCode: 409,
    });
  });
});