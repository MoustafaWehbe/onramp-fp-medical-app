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

jest.mock("../../src/services/clinic.service", () => ({
  clinicService: {
    list: jest.fn(),
    create: jest.fn(),
  },
}));

import { clinicService } from "../../src/services/clinic.service";

const mockClinicService = clinicService as jest.Mocked<typeof clinicService>;

describe("GET /api/clinics", () => {
  it("returns 200 with paginated clinics", async () => {
    mockClinicService.list.mockResolvedValue({
      data: [
        {
          id: "50000000-0000-0000-0000-000000000001",
          name: "City Medical Center",
          address: "123 Main St",
          phone: "+1234567890",
          createdAt: new Date("2026-01-10T00:00:00Z"),
        },
        {
          id: "50000000-0000-0000-0000-000000000002",
          name: "Westside Clinic",
          address: "456 Oak Ave",
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

    const res = await request(app).get("/api/clinics");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.currentPage).toBe(1);
    expect(mockClinicService.list).toHaveBeenCalledWith({
      currentPage: 1,
      pageSize: 10,
      search: undefined,
    });
  });

  it("passes pagination and db search query params to the service", async () => {
    mockClinicService.list.mockResolvedValue({
      data: [],
      pagination: {
        currentPage: 2,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0,
      },
    } as never);

    const res = await request(app).get(
      "/api/clinics?currentPage=2&pageSize=5&search=medical",
    );

    expect(res.status).toBe(200);
    expect(mockClinicService.list).toHaveBeenCalledWith({
      currentPage: 2,
      pageSize: 5,
      search: "medical",
    });
  });

  it("returns 422 when currentPage is invalid", async () => {
    const res = await request(app).get("/api/clinics?currentPage=0");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("currentPage");
  });
});

describe("POST /api/clinics", () => {
  it("returns 201 with the created clinic", async () => {
    mockClinicService.create.mockResolvedValue({
      id: "50000000-0000-0000-0000-000000000003",
      name: "North Health Clinic",
      address: "789 Pine Rd",
      phone: "+1111111111",
      createdAt: new Date("2026-01-10T00:00:00Z"),
      updatedAt: new Date("2026-01-10T00:00:00Z"),
    } as never);

    const res = await request(app).post("/api/clinics").send({
      name: "North Health Clinic",
      address: "789 Pine Rd",
      phone: "+1111111111",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("North Health Clinic");
    expect(mockClinicService.create).toHaveBeenCalledWith({
      name: "North Health Clinic",
      address: "789 Pine Rd",
      phone: "+1111111111",
    });
  });

  it("returns 422 when name is missing", async () => {
    const res = await request(app).post("/api/clinics").send({
      address: "123 Main St",
      phone: "+1234567890",
    });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("name");
  });

  it("returns 422 when address is missing", async () => {
    const res = await request(app).post("/api/clinics").send({
      name: "City Medical Center",
      phone: "+1234567890",
    });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("address");
  });

  it("returns 422 when phone is missing", async () => {
    const res = await request(app).post("/api/clinics").send({
      name: "City Medical Center",
      address: "123 Main St",
    });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("phone");
  });
});
