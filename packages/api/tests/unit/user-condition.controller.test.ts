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

jest.mock("../../src/services/user-condition.service", () => ({
  userConditionService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));

import { userConditionService } from "../../src/services/user-condition.service";

const mockUserConditionService = userConditionService as jest.Mocked<
  typeof userConditionService
>;

const USER_ID = "00000000-0000-0000-0000-000000000001";
const USER_CONDITION_ID = "61000000-0000-0000-0000-000000000001";
const CONDITION_ID = "60000000-0000-0000-0000-000000000001";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/profile/conditions", () => {
  it("returns 200 with paginated user conditions", async () => {
    mockUserConditionService.list.mockResolvedValue({
      data: [
        {
          id: USER_CONDITION_ID,
          userId: USER_ID,
          conditionId: CONDITION_ID,
          status: "active",
        },
      ],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
      },
    } as never);

    const res = await request(app).get("/api/profile/conditions");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(mockUserConditionService.list).toHaveBeenCalledWith({
      userId: USER_ID,
      currentPage: 1,
      pageSize: 10,
      search: undefined,
    
      language: "en",
    });
  });

  it("passes pagination and search to the service", async () => {
    mockUserConditionService.list.mockResolvedValue({
      data: [],
      pagination: {
        currentPage: 2,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0,
      },
    } as never);

    const res = await request(app).get(
      "/api/profile/conditions?currentPage=2&pageSize=5&search=hyper",
    );

    expect(res.status).toBe(200);
    expect(mockUserConditionService.list).toHaveBeenCalledWith({
      userId: USER_ID,
      currentPage: 2,
      pageSize: 5,
      search: "hyper",
    
      language: "en",
    });
  });

  it("returns 422 when currentPage is invalid", async () => {
    const res = await request(app).get("/api/profile/conditions?currentPage=0");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("currentPage");
  });
});

describe("GET /api/profile/conditions/:id", () => {
  it("returns 200 with the user condition", async () => {
    mockUserConditionService.getById.mockResolvedValue({
      id: USER_CONDITION_ID,
      userId: USER_ID,
      conditionId: CONDITION_ID,
    } as never);

    const res = await request(app).get(
      `/api/profile/conditions/${USER_CONDITION_ID}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(USER_CONDITION_ID);
    expect(mockUserConditionService.getById).toHaveBeenCalledWith(
      USER_ID,
      USER_CONDITION_ID,
      "en",
    );
  });

  it("returns 422 when id is not a uuid", async () => {
    const res = await request(app).get("/api/profile/conditions/not-a-uuid");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("id");
  });

  it("returns 404 when the user condition is not found", async () => {
    mockUserConditionService.getById.mockRejectedValue(
      createError("User condition not found", 404),
    );

    const res = await request(app).get(
      `/api/profile/conditions/${USER_CONDITION_ID}`,
    );

    expect(res.status).toBe(404);
  });
});

describe("POST /api/profile/conditions", () => {
  it("returns 201 with the created user condition", async () => {
    mockUserConditionService.create.mockResolvedValue({
      id: USER_CONDITION_ID,
      userId: USER_ID,
      conditionId: CONDITION_ID,
      diagnosedDate: "2024-01-01",
      status: "active",
    } as never);

    const res = await request(app).post("/api/profile/conditions").send({
      conditionId: CONDITION_ID,
      diagnosedDate: "2024-01-01",
      status: "active",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.conditionId).toBe(CONDITION_ID);
    expect(mockUserConditionService.create).toHaveBeenCalledWith({
      userId: USER_ID,
      conditionId: CONDITION_ID,
      diagnosedDate: "2024-01-01",
      status: "active",
    
      language: "en",
    });
  });

  it("returns 422 when conditionId is missing", async () => {
    const res = await request(app)
      .post("/api/profile/conditions")
      .send({ status: "active" });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("conditionId");
  });

  it("returns 422 when diagnosedDate is in the future", async () => {
    const res = await request(app)
      .post("/api/profile/conditions")
      .send({ conditionId: CONDITION_ID, diagnosedDate: "2999-01-01" });

    expect(res.status).toBe(422);
  });

  it("returns 409 when the condition is already linked", async () => {
    mockUserConditionService.create.mockRejectedValue(
      createError("Condition already linked to profile", 409),
    );

    const res = await request(app)
      .post("/api/profile/conditions")
      .send({ conditionId: CONDITION_ID });

    expect(res.status).toBe(409);
  });
});

describe("PATCH /api/profile/conditions/:id", () => {
  it("returns 200 with the updated user condition", async () => {
    mockUserConditionService.update.mockResolvedValue({
      id: USER_CONDITION_ID,
      userId: USER_ID,
      notes: "Updated notes",
    } as never);

    const res = await request(app)
      .patch(`/api/profile/conditions/${USER_CONDITION_ID}`)
      .send({ notes: "Updated notes" });

    expect(res.status).toBe(200);
    expect(res.body.data.notes).toBe("Updated notes");
    expect(mockUserConditionService.update).toHaveBeenCalledWith({
      userId: USER_ID,
      id: USER_CONDITION_ID,
      notes: "Updated notes",
    
      language: "en",
    });
  });

  it("returns 422 when body is empty", async () => {
    const res = await request(app)
      .patch(`/api/profile/conditions/${USER_CONDITION_ID}`)
      .send({});

    expect(res.status).toBe(422);
  });
});

describe("DELETE /api/profile/conditions/:id", () => {
  it("returns 200 with soft-deleted flag", async () => {
    mockUserConditionService.remove.mockResolvedValue({
      id: USER_CONDITION_ID,
      active: false,
    });

    const res = await request(app).delete(
      `/api/profile/conditions/${USER_CONDITION_ID}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ id: USER_CONDITION_ID, active: false });
    expect(mockUserConditionService.remove).toHaveBeenCalledWith(
      USER_ID,
      USER_CONDITION_ID,
    );
  });
});
