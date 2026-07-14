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

jest.mock("../../src/services/doctor.service", () => ({
  doctorService: {
    list: jest.fn(),
    create: jest.fn(),
  },
}));

import { doctorService } from "../../src/services/doctor.service";

const mockDoctorService = doctorService as jest.Mocked<typeof doctorService>;

describe("GET /api/doctors", () => {
  it("returns 200 with paginated doctors", async () => {
    mockDoctorService.list.mockResolvedValue({
      data: [
        {
          id: "40000000-0000-0000-0000-000000000001",
          name: "Dr. Smith",
          specialty: "Cardiology",
          phone: "+1234567890",
          createdAt: new Date("2026-01-10T00:00:00Z"),
        },
        {
          id: "40000000-0000-0000-0000-000000000002",
          name: "Dr. Jones",
          specialty: "General Practice",
          phone: "+0987654321",
          createdAt: new Date("2026-01-10T00:00:00Z"),
        },
      ],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalCount: 2,
        totalPages: 1,
      },
    } as never);

    const res = await request(app).get("/api/doctors");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.currentPage).toBe(1);
    expect(mockDoctorService.list).toHaveBeenCalledWith({
      currentPage: 1,
      pageSize: 10,
      search: undefined,
    });
  });

  it("passes pagination and db search query params to the service", async () => {
    mockDoctorService.list.mockResolvedValue({
      data: [],
      pagination: {
        currentPage: 2,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0,
      },
    } as never);

    const res = await request(app).get(
      "/api/doctors?currentPage=2&pageSize=5&search=cardio",
    );

    expect(res.status).toBe(200);
    expect(mockDoctorService.list).toHaveBeenCalledWith({
      currentPage: 2,
      pageSize: 5,
      search: "cardio",
    });
  });

  it("returns 422 when currentPage is invalid", async () => {
    const res = await request(app).get("/api/doctors?currentPage=0");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("currentPage");
  });
});

describe("POST /api/doctors", () => {
  it("returns 201 with the created doctor", async () => {
    mockDoctorService.create.mockResolvedValue({
      id: "40000000-0000-0000-0000-000000000003",
      name: "Dr. Adams",
      specialty: "Dermatology",
      phone: "+1111111111",
      createdAt: new Date("2026-01-10T00:00:00Z"),
      updatedAt: new Date("2026-01-10T00:00:00Z"),
    } as never);

    const res = await request(app).post("/api/doctors").send({
      name: "Dr. Adams",
      specialty: "Dermatology",
      phone: "+1111111111",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Dr. Adams");
    expect(mockDoctorService.create).toHaveBeenCalledWith({
      name: "Dr. Adams",
      specialty: "Dermatology",
      phone: "+1111111111",
    });
  });

  it("returns 422 when name is missing", async () => {
    const res = await request(app).post("/api/doctors").send({
      specialty: "Cardiology",
    });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("name");
  });
});
