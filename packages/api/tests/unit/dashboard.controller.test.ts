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

jest.mock("../../src/services/dashboard.service", () => ({
  dashboardService: {
    getDashboard: jest.fn(),
  },
}));

import { dashboardService } from "../../src/services/dashboard.service";

const mockDashboardService = dashboardService as jest.Mocked<
  typeof dashboardService
>;

const USER_ID = "00000000-0000-0000-0000-000000000001";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/profile/dashboard", () => {
  it("returns 200 with the dashboard data", async () => {
    mockDashboardService.getDashboard.mockResolvedValue({
      stats: {
        entryCount: 12,
        activeMedicationCount: 2,
        activeConditionCount: 1,
        avgMood: 3.5,
      },
      recentEntries: [],
      lastVisit: null,
    } as never);

    const res = await request(app).get("/api/profile/dashboard");

    expect(res.status).toBe(200);
    expect(res.body.data.stats.entryCount).toBe(12);
    expect(mockDashboardService.getDashboard).toHaveBeenCalledWith(USER_ID);
  });
});
