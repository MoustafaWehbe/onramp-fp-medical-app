import type { Request } from "express";
import request from "supertest";
import { app } from "../../app";
import { createError } from "../../src/middleware/error-handler";

jest.mock("../../src/lib/db", () => ({
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
  getDatabase: jest.fn(),
}));

jest.mock("../../src/middleware/authenticate", () => ({
  authenticate: (req: Request, _res: unknown, next: () => void) => {
    req.user = {
      userId: "00000000-0000-0000-0000-000000000001",
      email: "test@example.com",
      role: "user",
      sessionId: "00000000-0000-0000-0000-000000000002",
    };
    next();
  },
}));

jest.mock("../../src/services/user-medication.service", () => ({
  userMedicationService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));

import { userMedicationService } from "../../src/services/user-medication.service";

const mockUserMedicationService = userMedicationService as jest.Mocked<
  typeof userMedicationService
>;

const USER_ID = "00000000-0000-0000-0000-000000000001";
const USER_MEDICATION_ID = "31000000-0000-0000-0000-000000000001";
const MEDICATION_ID = "30000000-0000-0000-0000-000000000001";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/profile/medications", () => {
  it("returns 200 with paginated user medications", async () => {
    mockUserMedicationService.list.mockResolvedValue({
      data: [
        {
          id: USER_MEDICATION_ID,
          userId: USER_ID,
          medicationId: MEDICATION_ID,
          dosage: 500,
          dosageMeasurement: "mg",
          active: true,
        },
      ],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
      },
    } as never);

    const res = await request(app).get("/api/profile/medications");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(mockUserMedicationService.list).toHaveBeenCalledWith({
      userId: USER_ID,
      currentPage: 1,
      pageSize: 10,
      search: undefined,
    });
  });

  it("passes pagination and search to the service", async () => {
    mockUserMedicationService.list.mockResolvedValue({
      data: [],
      pagination: {
        currentPage: 2,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0,
      },
    } as never);

    const res = await request(app).get(
      "/api/profile/medications?currentPage=2&pageSize=5&search=panadol",
    );

    expect(res.status).toBe(200);
    expect(mockUserMedicationService.list).toHaveBeenCalledWith({
      userId: USER_ID,
      currentPage: 2,
      pageSize: 5,
      search: "panadol",
    });
  });

  it("returns 422 when currentPage is invalid", async () => {
    const res = await request(app).get("/api/profile/medications?currentPage=0");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("currentPage");
  });
});

describe("GET /api/profile/medications/:id", () => {
  it("returns 200 with the user medication", async () => {
    mockUserMedicationService.getById.mockResolvedValue({
      id: USER_MEDICATION_ID,
      userId: USER_ID,
      medicationId: MEDICATION_ID,
    } as never);

    const res = await request(app).get(
      `/api/profile/medications/${USER_MEDICATION_ID}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(USER_MEDICATION_ID);
    expect(mockUserMedicationService.getById).toHaveBeenCalledWith(
      USER_ID,
      USER_MEDICATION_ID,
    );
  });

  it("returns 422 when id is not a uuid", async () => {
    const res = await request(app).get("/api/profile/medications/not-a-uuid");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("id");
  });

  it("returns 404 when the user medication is not found", async () => {
    mockUserMedicationService.getById.mockRejectedValue(
      createError("User medication not found", 404),
    );

    const res = await request(app).get(
      `/api/profile/medications/${USER_MEDICATION_ID}`,
    );

    expect(res.status).toBe(404);
  });
});

describe("POST /api/profile/medications", () => {
  it("returns 201 with the created user medication", async () => {
    mockUserMedicationService.create.mockResolvedValue({
      id: USER_MEDICATION_ID,
      userId: USER_ID,
      medicationId: MEDICATION_ID,
      dosage: 500,
      dosageMeasurement: "mg",
    } as never);

    const res = await request(app).post("/api/profile/medications").send({
      medicationId: MEDICATION_ID,
      dosage: 500,
      dosageMeasurement: "mg",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.medicationId).toBe(MEDICATION_ID);
    expect(mockUserMedicationService.create).toHaveBeenCalledWith({
      userId: USER_ID,
      medicationId: MEDICATION_ID,
      dosage: 500,
      dosageMeasurement: "mg",
    });
  });

  it("returns 422 when medicationId is missing", async () => {
    const res = await request(app)
      .post("/api/profile/medications")
      .send({ dosage: 500, dosageMeasurement: "mg" });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("medicationId");
  });

  it("returns 422 when dosage is provided without a measurement", async () => {
    const res = await request(app)
      .post("/api/profile/medications")
      .send({ medicationId: MEDICATION_ID, dosage: 500 });

    expect(res.status).toBe(422);
  });

  it("returns 409 when the medication is already linked", async () => {
    mockUserMedicationService.create.mockRejectedValue(
      createError("Medication already linked to profile", 409),
    );

    const res = await request(app)
      .post("/api/profile/medications")
      .send({ medicationId: MEDICATION_ID });

    expect(res.status).toBe(409);
  });
});

describe("PATCH /api/profile/medications/:id", () => {
  it("returns 200 with the updated user medication", async () => {
    mockUserMedicationService.update.mockResolvedValue({
      id: USER_MEDICATION_ID,
      userId: USER_ID,
      frequency: "Twice daily",
    } as never);

    const res = await request(app)
      .patch(`/api/profile/medications/${USER_MEDICATION_ID}`)
      .send({ frequency: "Twice daily" });

    expect(res.status).toBe(200);
    expect(res.body.data.frequency).toBe("Twice daily");
    expect(mockUserMedicationService.update).toHaveBeenCalledWith({
      userId: USER_ID,
      id: USER_MEDICATION_ID,
      frequency: "Twice daily",
    });
  });

  it("returns 422 when body is empty", async () => {
    const res = await request(app)
      .patch(`/api/profile/medications/${USER_MEDICATION_ID}`)
      .send({});

    expect(res.status).toBe(422);
  });

  it("returns 422 when dosage is provided without a measurement", async () => {
    const res = await request(app)
      .patch(`/api/profile/medications/${USER_MEDICATION_ID}`)
      .send({ dosage: 500 });

    expect(res.status).toBe(422);
  });
});

describe("DELETE /api/profile/medications/:id", () => {
  it("returns 200 with soft-deleted flag", async () => {
    mockUserMedicationService.remove.mockResolvedValue({
      id: USER_MEDICATION_ID,
      active: false,
    });

    const res = await request(app).delete(
      `/api/profile/medications/${USER_MEDICATION_ID}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ id: USER_MEDICATION_ID, active: false });
    expect(mockUserMedicationService.remove).toHaveBeenCalledWith(
      USER_ID,
      USER_MEDICATION_ID,
    );
  });
});
