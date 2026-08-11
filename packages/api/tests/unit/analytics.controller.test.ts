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

jest.mock("../../src/services/analytics.service", () => ({
  analyticsService: {
    getDashboard: jest.fn(),
  },
}));

import { analyticsService } from "../../src/services/analytics.service";

const mockAnalyticsService = analyticsService as jest.Mocked<
  typeof analyticsService
>;

const USER_ID = "00000000-0000-0000-0000-000000000001";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/analytics/dashboard", () => {
  it("returns 200 with the dashboard data", async () => {
    mockAnalyticsService.getDashboard.mockResolvedValue({
      period: 30,
      moodTrend: [],
      sleepTrend: [],
      symptomFrequency: [],
    } as never);

    const res = await request(app).get("/api/analytics/dashboard");

    expect(res.status).toBe(200);
    expect(res.body.data.period).toBe(30);
    expect(mockAnalyticsService.getDashboard).toHaveBeenCalledWith({
      userId: USER_ID,
      days: undefined,
    });
  });

  it("passes days to the service", async () => {
    mockAnalyticsService.getDashboard.mockResolvedValue({
      period: 90,
      moodTrend: [],
      sleepTrend: [],
      symptomFrequency: [],
    } as never);

    const res = await request(app).get("/api/analytics/dashboard?days=90");

    expect(res.status).toBe(200);
    expect(mockAnalyticsService.getDashboard).toHaveBeenCalledWith({
      userId: USER_ID,
      days: 90,
    });
  });

  it("returns 422 when days is zero", async () => {
    const res = await request(app).get("/api/analytics/dashboard?days=0");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("days");
  });

  it("returns 422 when days is negative", async () => {
    const res = await request(app).get("/api/analytics/dashboard?days=-1");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("days");
  });

  it("returns 422 when days exceeds 365", async () => {
    const res = await request(app).get("/api/analytics/dashboard?days=400");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("days");
  });

  it("returns 422 when days is not an integer", async () => {
    const res = await request(app).get("/api/analytics/dashboard?days=1.5");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("days");
  });
});
