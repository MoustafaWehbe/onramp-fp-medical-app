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

jest.mock("../../src/services/conditions.service", () => ({
  conditionService: {
    list: jest.fn(),
    create: jest.fn(),
    searchConditions: jest.fn(),
    getById: jest.fn(),
  },
}));

jest.mock("axios", () => ({
  isAxiosError: jest.fn(),
}));

import { conditionService } from "../../src/services/conditions.service";
import axios from "axios";

const mockConditionService = conditionService as jest.Mocked<
  typeof conditionService
>;

const mockAxios = axios as jest.Mocked<typeof axios>;

const CONDITION_ID = "60000000-0000-0000-0000-000000000001";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/conditions", () => {
  it("returns 200 with paginated conditions", async () => {
    mockConditionService.list.mockResolvedValue({
      data: [
        {
          id: CONDITION_ID,
          name: "Hypertension",
          createdAt: new Date("2026-01-10T00:00:00Z"),
        },
      ],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
      },
    } as never);

    const res = await request(app).get("/api/conditions");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(mockConditionService.list).toHaveBeenCalledWith({
      currentPage: 1,
      pageSize: 10,
      search: undefined,
    
      language: "en",
    });
  });

  it("passes pagination and search to the service", async () => {
    mockConditionService.list.mockResolvedValue({
      data: [],
      pagination: {
        currentPage: 2,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0,
      },
    } as never);

    const res = await request(app).get(
      "/api/conditions?currentPage=2&pageSize=5&search=hyper",
    );

    expect(res.status).toBe(200);
    expect(mockConditionService.list).toHaveBeenCalledWith({
      currentPage: 2,
      pageSize: 5,
      search: "hyper",
    
      language: "en",
    });
  });

  it("returns 422 when currentPage is invalid", async () => {
    const res = await request(app).get("/api/conditions?currentPage=0");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("currentPage");
  });
});

describe("GET /api/conditions/search-online", () => {
  it("returns 200 with condition suggestions", async () => {
    mockConditionService.searchConditions.mockResolvedValue([
      "Hypertension",
      "Hypothyroidism",
    ]);

    const res = await request(app).get(
      "/api/conditions/search-online?search=hyper",
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual(["Hypertension", "Hypothyroidism"]);
    expect(mockConditionService.searchConditions).toHaveBeenCalledWith("hyper");
  });

  it("returns 422 when search is missing", async () => {
    const res = await request(app).get("/api/conditions/search-online");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("search");
  });

  it("returns 502 when the external API is unavailable", async () => {
    mockAxios.isAxiosError.mockReturnValue(true);
    mockConditionService.searchConditions.mockRejectedValue(
      new Error("External API down"),
    );

    const res = await request(app).get(
      "/api/conditions/search-online?search=hyper",
    );

    expect(res.status).toBe(502);
    expect(res.body.error).toBe("External conditions API unavailable");
  });
});

describe("GET /api/conditions/:id", () => {
  it("returns 200 with the condition", async () => {
    mockConditionService.getById.mockResolvedValue({
      id: CONDITION_ID,
      name: "Hypertension",
    } as never);

    const res = await request(app).get(`/api/conditions/${CONDITION_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(CONDITION_ID);
    expect(mockConditionService.getById).toHaveBeenCalledWith(CONDITION_ID, "en");
  });

  it("returns 422 when id is not a uuid", async () => {
    const res = await request(app).get("/api/conditions/not-a-uuid");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("id");
  });

  it("returns 404 when the condition is not found", async () => {
    mockConditionService.getById.mockRejectedValue(
      createError("Condition not found", 404),
    );

    const res = await request(app).get(`/api/conditions/${CONDITION_ID}`);

    expect(res.status).toBe(404);
  });
});

describe("POST /api/conditions", () => {
  it("returns 201 with the created condition", async () => {
    mockConditionService.create.mockResolvedValue({
      id: "60000000-0000-0000-0000-000000000002",
      name: "Diabetes",
    } as never);

    const res = await request(app).post("/api/conditions").send({
      name: "Diabetes",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Diabetes");
    expect(mockConditionService.create).toHaveBeenCalledWith({
      name: "Diabetes",
    });
  });

  it("returns 422 when name is missing", async () => {
    const res = await request(app).post("/api/conditions").send({});

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("name");
  });

  it("returns 409 when the condition already exists", async () => {
    mockConditionService.create.mockRejectedValue(
      createError("Condition already exists", 409),
    );

    const res = await request(app).post("/api/conditions").send({
      name: "Diabetes",
    });

    expect(res.status).toBe(409);
  });
});
