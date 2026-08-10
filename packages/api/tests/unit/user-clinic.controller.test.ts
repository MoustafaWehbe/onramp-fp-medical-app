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

jest.mock("../../src/services/user-clinic.service", () => ({
  userClinicService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));

import { userClinicService } from "../../src/services/user-clinic.service";

const mockUserClinicService = userClinicService as jest.Mocked<
  typeof userClinicService
>;

const USER_ID = "00000000-0000-0000-0000-000000000001";
const USER_CLINIC_ID = "51000000-0000-0000-0000-000000000001";
const CLINIC_ID = "50000000-0000-0000-0000-000000000001";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/profile/clinics", () => {
  it("returns 200 with paginated user clinics", async () => {
    mockUserClinicService.list.mockResolvedValue({
      data: [
        {
          id: USER_CLINIC_ID,
          userId: USER_ID,
          clinicId: CLINIC_ID,
          notes: "Primary clinic",
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

    const res = await request(app).get("/api/profile/clinics");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(mockUserClinicService.list).toHaveBeenCalledWith({
      userId: USER_ID,
      currentPage: 1,
      pageSize: 10,
      search: undefined,
    });
  });

  it("passes pagination and search to the service", async () => {
    mockUserClinicService.list.mockResolvedValue({
      data: [],
      pagination: {
        currentPage: 2,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0,
      },
    } as never);

    const res = await request(app).get(
      "/api/profile/clinics?currentPage=2&pageSize=5&search=city",
    );

    expect(res.status).toBe(200);
    expect(mockUserClinicService.list).toHaveBeenCalledWith({
      userId: USER_ID,
      currentPage: 2,
      pageSize: 5,
      search: "city",
    });
  });

  it("returns 422 when currentPage is invalid", async () => {
    const res = await request(app).get("/api/profile/clinics?currentPage=0");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("currentPage");
  });
});

describe("GET /api/profile/clinics/:id", () => {
  it("returns 200 with the user clinic", async () => {
    mockUserClinicService.getById.mockResolvedValue({
      id: USER_CLINIC_ID,
      userId: USER_ID,
      clinicId: CLINIC_ID,
    } as never);

    const res = await request(app).get(`/api/profile/clinics/${USER_CLINIC_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(USER_CLINIC_ID);
    expect(mockUserClinicService.getById).toHaveBeenCalledWith(
      USER_ID,
      USER_CLINIC_ID,
    );
  });

  it("returns 422 when id is not a uuid", async () => {
    const res = await request(app).get("/api/profile/clinics/not-a-uuid");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("id");
  });

  it("returns 404 when the user clinic is not found", async () => {
    mockUserClinicService.getById.mockRejectedValue(
      createError("User clinic not found", 404),
    );

    const res = await request(app).get(`/api/profile/clinics/${USER_CLINIC_ID}`);

    expect(res.status).toBe(404);
  });
});

describe("POST /api/profile/clinics", () => {
  it("returns 201 with the linked clinic", async () => {
    mockUserClinicService.create.mockResolvedValue({
      id: USER_CLINIC_ID,
      userId: USER_ID,
      clinicId: CLINIC_ID,
      notes: "Primary clinic",
    } as never);

    const res = await request(app).post("/api/profile/clinics").send({
      clinicId: CLINIC_ID,
      notes: "Primary clinic",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.clinicId).toBe(CLINIC_ID);
    expect(mockUserClinicService.create).toHaveBeenCalledWith({
      userId: USER_ID,
      clinicId: CLINIC_ID,
      notes: "Primary clinic",
    });
  });

  it("returns 422 when clinicId is missing", async () => {
    const res = await request(app)
      .post("/api/profile/clinics")
      .send({ notes: "Missing clinic" });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("clinicId");
  });

  it("returns 409 when the clinic is already linked", async () => {
    mockUserClinicService.create.mockRejectedValue(
      createError("Clinic already linked to profile", 409),
    );

    const res = await request(app)
      .post("/api/profile/clinics")
      .send({ clinicId: CLINIC_ID });

    expect(res.status).toBe(409);
  });
});

describe("PATCH /api/profile/clinics/:id", () => {
  it("returns 200 with the updated user clinic", async () => {
    mockUserClinicService.update.mockResolvedValue({
      id: USER_CLINIC_ID,
      userId: USER_ID,
      clinicId: CLINIC_ID,
      notes: "Updated notes",
    } as never);

    const res = await request(app)
      .patch(`/api/profile/clinics/${USER_CLINIC_ID}`)
      .send({ notes: "Updated notes" });

    expect(res.status).toBe(200);
    expect(res.body.data.notes).toBe("Updated notes");
    expect(mockUserClinicService.update).toHaveBeenCalledWith({
      userId: USER_ID,
      id: USER_CLINIC_ID,
      notes: "Updated notes",
    });
  });

  it("returns 422 when body is empty", async () => {
    const res = await request(app)
      .patch(`/api/profile/clinics/${USER_CLINIC_ID}`)
      .send({});

    expect(res.status).toBe(422);
  });
});

describe("DELETE /api/profile/clinics/:id", () => {
  it("returns 200 with soft-deleted flag", async () => {
    mockUserClinicService.remove.mockResolvedValue({
      id: USER_CLINIC_ID,
      active: false,
    });

    const res = await request(app).delete(
      `/api/profile/clinics/${USER_CLINIC_ID}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ id: USER_CLINIC_ID, active: false });
    expect(mockUserClinicService.remove).toHaveBeenCalledWith(
      USER_ID,
      USER_CLINIC_ID,
    );
  });
});
