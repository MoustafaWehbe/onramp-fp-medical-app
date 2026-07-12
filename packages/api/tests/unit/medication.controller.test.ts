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

jest.mock("../../src/services/medication.service", () => ({
  medicationService: {
    list: jest.fn(),
    create: jest.fn(),
    searchNames: jest.fn(),
    lookupCategoryOnline: jest.fn(),
  },
}));

import { medicationService } from "../../src/services/medication.service";

const mockMedicationService = medicationService as jest.Mocked<
  typeof medicationService
>;

describe("GET /api/medications", () => {
  it("returns 200 with paginated medications", async () => {
    mockMedicationService.list.mockResolvedValue({
      data: [
        {
          id: "30000000-0000-0000-0000-000000000001",
          name: "Panadol",
          strength: "500mg",
          category: "Painkiller",
          createdAt: new Date("2026-01-10T00:00:00Z"),
        },
        {
          id: "30000000-0000-0000-0000-000000000002",
          name: "Ibuprofen",
          strength: "400mg",
          category: "Painkiller",
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

    const res = await request(app).get("/api/medications");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.currentPage).toBe(1);
    expect(mockMedicationService.list).toHaveBeenCalledWith({
      currentPage: 1,
      pageSize: 10,
      search: undefined,
    });
  });

  it("passes pagination and db search query params to the service", async () => {
    mockMedicationService.list.mockResolvedValue({
      data: [],
      pagination: {
        currentPage: 2,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0,
      },
    } as never);

    const res = await request(app).get(
      "/api/medications?currentPage=2&pageSize=5&search=panadol",
    );

    expect(res.status).toBe(200);
    expect(mockMedicationService.list).toHaveBeenCalledWith({
      currentPage: 2,
      pageSize: 5,
      search: "panadol",
    });
  });

  it("returns 422 when currentPage is invalid", async () => {
    const res = await request(app).get("/api/medications?currentPage=0");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("currentPage");
  });
});

describe("POST /api/medications", () => {
  it("returns 201 with the created medication", async () => {
    mockMedicationService.create.mockResolvedValue({
      id: "30000000-0000-0000-0000-000000000004",
      name: "Aspirin",
      strength: "100mg",
      category: "Painkiller",
      createdAt: new Date("2026-01-10T00:00:00Z"),
      updatedAt: new Date("2026-01-10T00:00:00Z"),
    } as never);

    const res = await request(app).post("/api/medications").send({
      name: "Aspirin",
      strength: "100mg",
      category: "Painkiller",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Aspirin");
    expect(mockMedicationService.create).toHaveBeenCalledWith({
      name: "Aspirin",
      strength: "100mg",
      category: "Painkiller",
    });
  });

  it("returns 422 when name is missing", async () => {
    const res = await request(app).post("/api/medications").send({
      strength: "100mg",
    });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("name");
  });
});

describe("GET /api/medications/search-online", () => {
  it("returns 200 with medication name suggestions", async () => {
    mockMedicationService.searchNames.mockResolvedValue([
      "Ibuprofen",
      "Advil",
    ]);

    const res = await request(app).get(
      "/api/medications/search-online?search=ibupro",
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual(["Ibuprofen", "Advil"]);
    expect(mockMedicationService.searchNames).toHaveBeenCalledWith("ibupro");
  });

  it("returns an empty array when no medications are found", async () => {
    mockMedicationService.searchNames.mockResolvedValue([]);

    const res = await request(app).get(
      "/api/medications/search-online?search=xyznone",
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns 422 when search is missing", async () => {
    const res = await request(app).get("/api/medications/search-online");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("search");
  });
});

describe("GET /api/medications/category-online", () => {
  it("returns 200 with a single category word", async () => {
    mockMedicationService.lookupCategoryOnline.mockResolvedValue("Painkiller");

    const res = await request(app).get(
      "/api/medications/category-online?name=Ibuprofen",
    );

    expect(res.status).toBe(200);
    expect(res.body).toBe("Painkiller");
    expect(mockMedicationService.lookupCategoryOnline).toHaveBeenCalledWith(
      "Ibuprofen",
    );
  });

  it("returns null when no category is found", async () => {
    mockMedicationService.lookupCategoryOnline.mockResolvedValue(null);

    const res = await request(app).get(
      "/api/medications/category-online?name=unknown-medication",
    );

    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it("returns 422 when name is missing", async () => {
    const res = await request(app).get("/api/medications/category-online");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("name");
  });
});
