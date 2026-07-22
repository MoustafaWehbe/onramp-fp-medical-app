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

jest.mock("../../src/services/symptom.service", () => ({
  symptomCatalogService: {
    list: jest.fn(),
    create: jest.fn(),
    searchSymptomsOnline: jest.fn(),
  },
}));

import { symptomCatalogService } from "../../src/services/symptom.service";

const mockCatalogService = symptomCatalogService as jest.Mocked<
  typeof symptomCatalogService
>;

describe("GET /api/catalog/symptoms", () => {
  it("returns 200 with paginated symptoms", async () => {
    mockCatalogService.list.mockResolvedValue({
      data: [
        {
          id: "40000000-0000-0000-0000-000000000001",
          name: "Headache",
          createdAt: new Date("2026-01-10T00:00:00Z"),
        },
        {
          id: "40000000-0000-0000-0000-000000000002",
          name: "Fatigue",
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

    const res = await request(app).get("/api/catalog/symptoms");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.currentPage).toBe(1);
    expect(mockCatalogService.list).toHaveBeenCalledWith({
      currentPage: 1,
      pageSize: 10,
      search: undefined,
    });
  });

  it("passes pagination and search query params to the service", async () => {
    mockCatalogService.list.mockResolvedValue({
      data: [],
      pagination: {
        currentPage: 2,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0,
      },
    } as never);

    const res = await request(app).get(
      "/api/catalog/symptoms?currentPage=2&pageSize=5&search=Headache",
    );

    expect(res.status).toBe(200);
    expect(mockCatalogService.list).toHaveBeenCalledWith({
      currentPage: 2,
      pageSize: 5,
      search: "Headache",
    });
  });

  it("returns 422 when currentPage is invalid", async () => {
    const res = await request(app).get("/api/catalog/symptoms?currentPage=0");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("currentPage");
  });
});

describe("POST /api/catalog/symptoms", () => {
  it("returns 201 with the created symptom", async () => {
    mockCatalogService.create.mockResolvedValue({
      id: "40000000-0000-0000-0000-000000000003",
      name: "Dizziness",
      createdAt: new Date("2026-01-10T00:00:00Z"),
      updatedAt: new Date("2026-01-10T00:00:00Z"),
    } as never);

    const res = await request(app).post("/api/catalog/symptoms").send({
      name: "Dizziness",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Dizziness");
    expect(mockCatalogService.create).toHaveBeenCalledWith({
      name: "Dizziness",
    });
  });

  it("returns 422 when name is missing", async () => {
    const res = await request(app).post("/api/catalog/symptoms").send({
      category: "Neurological",
    });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("name");
  });
});

describe("GET /api/catalog/symptoms/search-online", () => {
  it("returns 200 with symptom name suggestions", async () => {
    mockCatalogService.searchSymptomsOnline.mockResolvedValue([
      "Headache",
      "Migraine",
    ]);

    const res = await request(app).get(
      "/api/catalog/symptoms/search-online?search=head",
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual(["Headache", "Migraine"]);
    expect(mockCatalogService.searchSymptomsOnline).toHaveBeenCalledWith("head");
  });

  it("returns an empty array when no symptoms are found", async () => {
    mockCatalogService.searchSymptomsOnline.mockResolvedValue([]);

    const res = await request(app).get(
      "/api/catalog/symptoms/search-online?search=xyznone",
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns 422 when search is missing", async () => {
    const res = await request(app).get("/api/catalog/symptoms/search-online");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("search");
  });
});
