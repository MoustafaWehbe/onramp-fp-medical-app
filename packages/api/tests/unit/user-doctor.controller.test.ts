import type { Request } from "express";
import request from "supertest";
import { app } from "../../app";

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

jest.mock("../../src/services/user-doctor.service", () => ({
  userDoctorService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));

import { userDoctorService } from "../../src/services/user-doctor.service";

const mockUserDoctorService = userDoctorService as jest.Mocked<
  typeof userDoctorService
>;

const USER_ID = "00000000-0000-0000-0000-000000000001";
const USER_DOCTOR_ID = "50000000-0000-0000-0000-000000000001";
const DOCTOR_ID = "40000000-0000-0000-0000-000000000001";

describe("GET /api/profile/doctors", () => {
  it("returns 200 with paginated user doctors", async () => {
    mockUserDoctorService.list.mockResolvedValue({
      data: [
        {
          id: USER_DOCTOR_ID,
          userId: USER_ID,
          doctorId: DOCTOR_ID,
          notes: "Primary cardiologist",
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

    const res = await request(app).get("/api/profile/doctors");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(mockUserDoctorService.list).toHaveBeenCalledWith({
      userId: USER_ID,
      currentPage: 1,
      pageSize: 10,
      search: undefined,
    });
  });

  it("passes pagination and search to the service", async () => {
    mockUserDoctorService.list.mockResolvedValue({
      data: [],
      pagination: {
        currentPage: 2,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0,
      },
    } as never);

    const res = await request(app).get(
      "/api/profile/doctors?currentPage=2&pageSize=5&search=cardio",
    );

    expect(res.status).toBe(200);
    expect(mockUserDoctorService.list).toHaveBeenCalledWith({
      userId: USER_ID,
      currentPage: 2,
      pageSize: 5,
      search: "cardio",
    });
  });

  it("returns 422 when currentPage is invalid", async () => {
    const res = await request(app).get("/api/profile/doctors?currentPage=0");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("currentPage");
  });
});

describe("GET /api/profile/doctors/:id", () => {
  it("returns 200 with the user doctor", async () => {
    mockUserDoctorService.getById.mockResolvedValue({
      id: USER_DOCTOR_ID,
      userId: USER_ID,
      doctorId: DOCTOR_ID,
    } as never);

    const res = await request(app).get(`/api/profile/doctors/${USER_DOCTOR_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(USER_DOCTOR_ID);
    expect(mockUserDoctorService.getById).toHaveBeenCalledWith(
      USER_ID,
      USER_DOCTOR_ID,
    );
  });

  it("returns 422 when id is not a uuid", async () => {
    const res = await request(app).get("/api/profile/doctors/not-a-uuid");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("id");
  });
});

describe("POST /api/profile/doctors", () => {
  it("returns 201 with the linked doctor", async () => {
    mockUserDoctorService.create.mockResolvedValue({
      id: USER_DOCTOR_ID,
      userId: USER_ID,
      doctorId: DOCTOR_ID,
      notes: "Rheumatologist",
    } as never);

    const res = await request(app).post("/api/profile/doctors").send({
      doctorId: DOCTOR_ID,
      notes: "Rheumatologist",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.doctorId).toBe(DOCTOR_ID);
    expect(mockUserDoctorService.create).toHaveBeenCalledWith({
      userId: USER_ID,
      doctorId: DOCTOR_ID,
      notes: "Rheumatologist",
    });
  });

  it("returns 422 when doctorId is missing", async () => {
    const res = await request(app).post("/api/profile/doctors").send({
      notes: "Missing doctor",
    });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("doctorId");
  });
});

describe("PATCH /api/profile/doctors/:id", () => {
  it("returns 200 with the updated user doctor", async () => {
    mockUserDoctorService.update.mockResolvedValue({
      id: USER_DOCTOR_ID,
      userId: USER_ID,
      doctorId: DOCTOR_ID,
      notes: "Updated notes",
    } as never);

    const res = await request(app)
      .patch(`/api/profile/doctors/${USER_DOCTOR_ID}`)
      .send({ notes: "Updated notes" });

    expect(res.status).toBe(200);
    expect(res.body.data.notes).toBe("Updated notes");
    expect(mockUserDoctorService.update).toHaveBeenCalledWith({
      userId: USER_ID,
      id: USER_DOCTOR_ID,
      notes: "Updated notes",
    });
  });

  it("returns 422 when body is empty", async () => {
    const res = await request(app)
      .patch(`/api/profile/doctors/${USER_DOCTOR_ID}`)
      .send({});

    expect(res.status).toBe(422);
  });
});

describe("DELETE /api/profile/doctors/:id", () => {
  it("returns 200 with soft-deleted flag", async () => {
    mockUserDoctorService.remove.mockResolvedValue({
      id: USER_DOCTOR_ID,
      active: false,
    });

    const res = await request(app).delete(
      `/api/profile/doctors/${USER_DOCTOR_ID}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ id: USER_DOCTOR_ID, active: false });
    expect(mockUserDoctorService.remove).toHaveBeenCalledWith(
      USER_ID,
      USER_DOCTOR_ID,
    );
  });
});
