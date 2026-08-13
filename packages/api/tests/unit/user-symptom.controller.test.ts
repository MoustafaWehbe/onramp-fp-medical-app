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

jest.mock("../../src/services/user-symptom.service", () => ({
  userSymptomService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  },
}));

import { userSymptomService } from "../../src/services/user-symptom.service";

const mockUserSymptomService = userSymptomService as jest.Mocked<
  typeof userSymptomService
>;

const USER_ID = "00000000-0000-0000-0000-000000000001";
const USER_SYMPTOM_ID = "71000000-0000-0000-0000-000000000001";
const CATALOG_ID = "40000000-0000-0000-0000-000000000001";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/profile/symptoms", () => {
  it("returns 200 with paginated user symptoms", async () => {
    mockUserSymptomService.list.mockResolvedValue({
      data: [
        {
          id: USER_SYMPTOM_ID,
          userId: USER_ID,
          catalogId: CATALOG_ID,
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

    const res = await request(app).get("/api/profile/symptoms");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(mockUserSymptomService.list).toHaveBeenCalledWith({
      userId: USER_ID,
      currentPage: 1,
      pageSize: 10,
      search: undefined,
    });
  });

  it("passes pagination and search to the service", async () => {
    mockUserSymptomService.list.mockResolvedValue({
      data: [],
      pagination: {
        currentPage: 2,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0,
      },
    } as never);

    const res = await request(app).get(
      "/api/profile/symptoms?currentPage=2&pageSize=5&search=headache",
    );

    expect(res.status).toBe(200);
    expect(mockUserSymptomService.list).toHaveBeenCalledWith({
      userId: USER_ID,
      currentPage: 2,
      pageSize: 5,
      search: "headache",
    });
  });

  it("returns 422 when currentPage is invalid", async () => {
    const res = await request(app).get("/api/profile/symptoms?currentPage=0");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("currentPage");
  });
});

describe("POST /api/profile/symptoms", () => {
  it("returns 201 with the created user symptom", async () => {
    mockUserSymptomService.create.mockResolvedValue({
      id: USER_SYMPTOM_ID,
      userId: USER_ID,
      catalogId: CATALOG_ID,
    } as never);

    const res = await request(app).post("/api/profile/symptoms").send({
      catalogId: CATALOG_ID,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.catalogId).toBe(CATALOG_ID);
    expect(mockUserSymptomService.create).toHaveBeenCalledWith({
      userId: USER_ID,
      catalogId: CATALOG_ID,
    });
  });

  it("returns 422 when catalogId is missing", async () => {
    const res = await request(app).post("/api/profile/symptoms").send({});

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("catalogId");
  });

  it("returns 409 when the symptom is already linked", async () => {
    mockUserSymptomService.create.mockRejectedValue(
      createError("Symptom already linked to profile", 409),
    );

    const res = await request(app)
      .post("/api/profile/symptoms")
      .send({ catalogId: CATALOG_ID });

    expect(res.status).toBe(409);
  });
});

describe("GET /api/profile/symptoms/:id", () => {
  it("returns 200 with the user symptom", async () => {
    mockUserSymptomService.getById.mockResolvedValue({
      id: USER_SYMPTOM_ID,
      userId: USER_ID,
      catalogId: CATALOG_ID,
    } as never);

    const res = await request(app).get(`/api/profile/symptoms/${USER_SYMPTOM_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(USER_SYMPTOM_ID);
    expect(mockUserSymptomService.getById).toHaveBeenCalledWith(
      USER_ID,
      USER_SYMPTOM_ID,
    );
  });

  it("returns 422 when id is not a uuid", async () => {
    const res = await request(app).get("/api/profile/symptoms/not-a-uuid");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("id");
  });

  it("returns 404 when the user symptom is not found", async () => {
    mockUserSymptomService.getById.mockRejectedValue(
      createError("User symptom not found", 404),
    );

    const res = await request(app).get(`/api/profile/symptoms/${USER_SYMPTOM_ID}`);

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/profile/symptoms/:id", () => {
  it("returns 200 with soft-deleted flag", async () => {
    mockUserSymptomService.remove.mockResolvedValue({
      id: USER_SYMPTOM_ID,
      active: false,
    });

    const res = await request(app).delete(`/api/profile/symptoms/${USER_SYMPTOM_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ id: USER_SYMPTOM_ID, active: false });
    expect(mockUserSymptomService.remove).toHaveBeenCalledWith(
      USER_ID,
      USER_SYMPTOM_ID,
    );
  });

  it("returns 404 when the user symptom is not found", async () => {
    mockUserSymptomService.remove.mockRejectedValue(
      createError("User symptom not found", 404),
    );

    const res = await request(app).delete(`/api/profile/symptoms/${USER_SYMPTOM_ID}`);

    expect(res.status).toBe(404);
  });
});
