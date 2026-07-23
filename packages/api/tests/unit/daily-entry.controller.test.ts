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

jest.mock("../../src/services/daily-entry.service", () => ({
  dailyEntryService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));

import { dailyEntryService } from "../../src/services/daily-entry.service";

const mockDailyEntryService = dailyEntryService as jest.Mocked<
  typeof dailyEntryService
>;

const USER_ID = "00000000-0000-0000-0000-000000000001";
const ENTRY_ID = "90000000-0000-0000-0000-000000000001";
const USER_SYMPTOM_ID = "70000000-0000-0000-0000-000000000001";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/profile/daily-entries", () => {
  it("returns 200 with paginated entries", async () => {
    mockDailyEntryService.list.mockResolvedValue({
      data: [{ id: ENTRY_ID, userId: USER_ID, entryDate: "2026-06-24" }],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
      },
    } as never);

    const res = await request(app).get("/api/profile/daily-entries");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(mockDailyEntryService.list).toHaveBeenCalledWith({
      userId: USER_ID,
      currentPage: 1,
      pageSize: 10,
      fromDate: undefined,
      toDate: undefined,
    });
  });

  it("passes pagination and date range to the service", async () => {
    mockDailyEntryService.list.mockResolvedValue({
      data: [],
      pagination: {
        currentPage: 2,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0,
      },
    } as never);

    const res = await request(app).get(
      "/api/profile/daily-entries?currentPage=2&pageSize=5&fromDate=2026-06-01&toDate=2026-06-30",
    );

    expect(res.status).toBe(200);
    expect(mockDailyEntryService.list).toHaveBeenCalledWith({
      userId: USER_ID,
      currentPage: 2,
      pageSize: 5,
      fromDate: "2026-06-01",
      toDate: "2026-06-30",
    });
  });

  it("returns 422 when currentPage is invalid", async () => {
    const res = await request(app).get(
      "/api/profile/daily-entries?currentPage=0",
    );

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("currentPage");
  });

  it("returns 422 when fromDate is after toDate", async () => {
    const res = await request(app).get(
      "/api/profile/daily-entries?fromDate=2026-06-30&toDate=2026-06-01",
    );

    expect(res.status).toBe(422);
  });
});

describe("GET /api/profile/daily-entries/:id", () => {
  it("returns 200 with the entry", async () => {
    mockDailyEntryService.getById.mockResolvedValue({
      id: ENTRY_ID,
      userId: USER_ID,
    } as never);

    const res = await request(app).get(
      `/api/profile/daily-entries/${ENTRY_ID}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(ENTRY_ID);
    expect(mockDailyEntryService.getById).toHaveBeenCalledWith(
      USER_ID,
      ENTRY_ID,
    );
  });

  it("returns 422 when id is not a uuid", async () => {
    const res = await request(app).get("/api/profile/daily-entries/not-a-uuid");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("id");
  });
});

describe("POST /api/profile/daily-entries", () => {
  it("returns 201 with the created entry", async () => {
    mockDailyEntryService.create.mockResolvedValue({
      id: ENTRY_ID,
      userId: USER_ID,
      entryDate: "2026-06-24",
    } as never);

    const res = await request(app)
      .post("/api/profile/daily-entries")
      .send({
        entryDate: "2026-06-24",
        moodRating: 3,
        symptoms: [{ userSymptomId: USER_SYMPTOM_ID, severity: 5 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe(ENTRY_ID);
    expect(mockDailyEntryService.create).toHaveBeenCalledWith({
      userId: USER_ID,
      entryDate: "2026-06-24",
      moodRating: 3,
      symptoms: [{ userSymptomId: USER_SYMPTOM_ID, severity: 5 }],
    });
  });

  it("returns 422 when entryDate is missing", async () => {
    const res = await request(app)
      .post("/api/profile/daily-entries")
      .send({ moodRating: 3 });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("entryDate");
  });

  it("returns 422 when moodRating is out of range", async () => {
    const res = await request(app)
      .post("/api/profile/daily-entries")
      .send({ entryDate: "2026-06-24", moodRating: 9 });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("moodRating");
  });
});

describe("PATCH /api/profile/daily-entries/:id", () => {
  it("returns 200 with the updated entry", async () => {
    mockDailyEntryService.update.mockResolvedValue({
      id: ENTRY_ID,
      userId: USER_ID,
      journalNotes: "Updated note",
    } as never);

    const res = await request(app)
      .patch(`/api/profile/daily-entries/${ENTRY_ID}`)
      .send({ journalNotes: "Updated note" });

    expect(res.status).toBe(200);
    expect(res.body.data.journalNotes).toBe("Updated note");
    expect(mockDailyEntryService.update).toHaveBeenCalledWith({
      userId: USER_ID,
      id: ENTRY_ID,
      journalNotes: "Updated note",
    });
  });

  it("returns 422 when body is empty", async () => {
    const res = await request(app)
      .patch(`/api/profile/daily-entries/${ENTRY_ID}`)
      .send({});

    expect(res.status).toBe(422);
  });
});

describe("DELETE /api/profile/daily-entries/:id", () => {
  it("returns 200 with a deleted result", async () => {
    mockDailyEntryService.remove.mockResolvedValue({
      id: ENTRY_ID,
      message: "Deleted",
    });

    const res = await request(app).delete(
      `/api/profile/daily-entries/${ENTRY_ID}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ id: ENTRY_ID, message: "Deleted" });
    expect(mockDailyEntryService.remove).toHaveBeenCalledWith(USER_ID, ENTRY_ID);
  });
});
