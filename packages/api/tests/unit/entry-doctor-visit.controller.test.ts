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

jest.mock("../../src/services/entry-doctor-visit.service", () => ({
  entryDoctorVisitService: {
    list: jest.fn(),
    getById: jest.fn(),
  },
}));

import { entryDoctorVisitService } from "../../src/services/entry-doctor-visit.service";

const mockEntryDoctorVisitService = entryDoctorVisitService as jest.Mocked<
  typeof entryDoctorVisitService
>;

const USER_ID = "00000000-0000-0000-0000-000000000001";
const DOCTOR_VISIT_ID = "80000000-0000-0000-0000-000000000001";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/profile/doctor-visits", () => {
  it("returns 200 with paginated doctor visits", async () => {
    mockEntryDoctorVisitService.list.mockResolvedValue({
      data: [
        {
          id: DOCTOR_VISIT_ID,
          entryId: "90000000-0000-0000-0000-000000000001",
        },
      ],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
      },
    } as never);

    const res = await request(app).get("/api/profile/doctor-visits");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(mockEntryDoctorVisitService.list).toHaveBeenCalledWith({
      userId: USER_ID,
      currentPage: 1,
      pageSize: 10,
    });
  });

  it("passes pagination to the service", async () => {
    mockEntryDoctorVisitService.list.mockResolvedValue({
      data: [],
      pagination: {
        currentPage: 2,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0,
      },
    } as never);

    const res = await request(app).get(
      "/api/profile/doctor-visits?currentPage=2&pageSize=5",
    );

    expect(res.status).toBe(200);
    expect(mockEntryDoctorVisitService.list).toHaveBeenCalledWith({
      userId: USER_ID,
      currentPage: 2,
      pageSize: 5,
    });
  });

  it("returns 422 when currentPage is invalid", async () => {
    const res = await request(app).get("/api/profile/doctor-visits?currentPage=0");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("currentPage");
  });
});

describe("GET /api/profile/doctor-visits/:id", () => {
  it("returns 200 with the doctor visit", async () => {
    mockEntryDoctorVisitService.getById.mockResolvedValue({
      id: DOCTOR_VISIT_ID,
      entryId: "90000000-0000-0000-0000-000000000001",
    } as never);

    const res = await request(app).get(
      `/api/profile/doctor-visits/${DOCTOR_VISIT_ID}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(DOCTOR_VISIT_ID);
    expect(mockEntryDoctorVisitService.getById).toHaveBeenCalledWith(
      USER_ID,
      DOCTOR_VISIT_ID,
    );
  });

  it("returns 422 when id is not a uuid", async () => {
    const res = await request(app).get("/api/profile/doctor-visits/not-a-uuid");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("id");
  });

  it("returns 404 when the doctor visit is not found", async () => {
    mockEntryDoctorVisitService.getById.mockRejectedValue(
      createError("Doctor visit not found", 404),
    );

    const res = await request(app).get(
      `/api/profile/doctor-visits/${DOCTOR_VISIT_ID}`,
    );

    expect(res.status).toBe(404);
  });
});
