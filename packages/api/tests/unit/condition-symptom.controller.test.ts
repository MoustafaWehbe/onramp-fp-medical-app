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

jest.mock("../../src/services/user-condition.service", () => ({
  userConditionService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock("../../src/services/condition-symptom.service", () => ({
  conditionSymptomService: {
    listAll: jest.fn(),
    list: jest.fn(),
    link: jest.fn(),
    unlink: jest.fn(),
  },
}));

import { conditionSymptomService } from "../../src/services/condition-symptom.service";

const mockService = conditionSymptomService as jest.Mocked<
  typeof conditionSymptomService
>;

const CONDITION_ID = "60000000-0000-0000-0000-000000000001";
const SYMPTOM_ID = "70000000-0000-0000-0000-000000000001";
const LINK_ID = "83000000-0000-0000-0000-000000000001";

describe("GET /api/profile/conditions/symptoms", () => {
  it("returns 200 with all paginated condition-symptom links", async () => {
    mockService.listAll.mockResolvedValue({
      data: [
        {
          id: LINK_ID,
          userConditionId: CONDITION_ID,
          userSymptomId: SYMPTOM_ID,
        },
      ],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
      },
    } as never);

    const res = await request(app).get("/api/profile/conditions/symptoms");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(mockService.listAll).toHaveBeenCalledWith({
      userId: "00000000-0000-0000-0000-000000000001",
      currentPage: 1,
      pageSize: 10,
    });
  });
});

describe("GET /api/profile/conditions/:id/symptoms", () => {
  it("returns 200 with paginated linked symptoms", async () => {
    mockService.list.mockResolvedValue({
      data: [
        {
          id: LINK_ID,
          userConditionId: CONDITION_ID,
          userSymptomId: SYMPTOM_ID,
        },
      ],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
      },
    } as never);

    const res = await request(app).get(
      `/api/profile/conditions/${CONDITION_ID}/symptoms`,
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(mockService.list).toHaveBeenCalledWith({
      userId: "00000000-0000-0000-0000-000000000001",
      userConditionId: CONDITION_ID,
      currentPage: 1,
      pageSize: 10,
    });
  });

  it("returns 422 when condition id is invalid", async () => {
    const res = await request(app).get(
      "/api/profile/conditions/not-a-uuid/symptoms",
    );

    expect(res.status).toBe(422);
  });
});

describe("POST /api/profile/conditions/:id/symptoms", () => {
  it("returns 201 when linking a symptom", async () => {
    mockService.link.mockResolvedValue({
      id: LINK_ID,
      userConditionId: CONDITION_ID,
      userSymptomId: SYMPTOM_ID,
    } as never);

    const res = await request(app)
      .post(`/api/profile/conditions/${CONDITION_ID}/symptoms`)
      .send({ userSymptomId: SYMPTOM_ID });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe(LINK_ID);
    expect(mockService.link).toHaveBeenCalledWith({
      userId: "00000000-0000-0000-0000-000000000001",
      userConditionId: CONDITION_ID,
      userSymptomId: SYMPTOM_ID,
    });
  });

  it("returns 409 when the symptom is already linked", async () => {
    mockService.link.mockRejectedValue(
      createError("Symptom already linked to condition", 409),
    );

    const res = await request(app)
      .post(`/api/profile/conditions/${CONDITION_ID}/symptoms`)
      .send({ userSymptomId: SYMPTOM_ID });

    expect(res.status).toBe(409);
  });

  it("returns 404 when the symptom is not owned", async () => {
    mockService.link.mockRejectedValue(
      createError("User symptom not found", 404),
    );

    const res = await request(app)
      .post(`/api/profile/conditions/${CONDITION_ID}/symptoms`)
      .send({ userSymptomId: SYMPTOM_ID });

    expect(res.status).toBe(404);
  });

  it("returns 422 when userSymptomId is missing", async () => {
    const res = await request(app)
      .post(`/api/profile/conditions/${CONDITION_ID}/symptoms`)
      .send({});

    expect(res.status).toBe(422);
  });
});

describe("DELETE /api/profile/conditions/:id/symptoms/:userSymptomId", () => {
  it("returns 200 when unlinking", async () => {
    mockService.unlink.mockResolvedValue({ message: "Unlinked" });

    const res = await request(app).delete(
      `/api/profile/conditions/${CONDITION_ID}/symptoms/${SYMPTOM_ID}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("Unlinked");
    expect(mockService.unlink).toHaveBeenCalledWith(
      "00000000-0000-0000-0000-000000000001",
      CONDITION_ID,
      SYMPTOM_ID,
    );
  });

  it("returns 404 when the link does not exist", async () => {
    mockService.unlink.mockRejectedValue(
      createError("Condition symptom link not found", 404),
    );

    const res = await request(app).delete(
      `/api/profile/conditions/${CONDITION_ID}/symptoms/${SYMPTOM_ID}`,
    );

    expect(res.status).toBe(404);
  });
});
