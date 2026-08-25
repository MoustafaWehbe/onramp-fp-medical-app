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

jest.mock("../../src/services/ai-report.service", () => ({
  aiReportService: {
    list: jest.fn(),
    generate: jest.fn(),
    getById: jest.fn(),
    remove: jest.fn(),
  },
}));

import { aiReportService } from "../../src/services/ai-report.service";

const mockAiReportService = aiReportService as jest.Mocked<
  typeof aiReportService
>;

const USER_ID = "00000000-0000-0000-0000-000000000001";
const REPORT_ID = "a1000000-0000-0000-0000-000000000001";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/ai-reports", () => {
  it("returns 200 with paginated reports", async () => {
    mockAiReportService.list.mockResolvedValue({
      data: [
        {
          id: REPORT_ID,
          userId: USER_ID,
          dateRangeStart: "2026-06-01",
          dateRangeEnd: "2026-06-30",
        },
      ],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
      },
    } as never);

    const res = await request(app).get("/api/ai-reports");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(mockAiReportService.list).toHaveBeenCalledWith({
      userId: USER_ID,
      currentPage: 1,
      pageSize: 10,
    });
  });

  it("passes pagination to the service", async () => {
    mockAiReportService.list.mockResolvedValue({
      data: [],
      pagination: {
        currentPage: 2,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0,
      },
    } as never);

    const res = await request(app).get("/api/ai-reports?currentPage=2&pageSize=5");

    expect(res.status).toBe(200);
    expect(mockAiReportService.list).toHaveBeenCalledWith({
      userId: USER_ID,
      currentPage: 2,
      pageSize: 5,
    });
  });

  it("returns 422 when currentPage is invalid", async () => {
    const res = await request(app).get("/api/ai-reports?currentPage=0");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("currentPage");
  });
});

describe("POST /api/ai-reports/generate", () => {
  it("returns 201 with the generated report", async () => {
    mockAiReportService.generate.mockResolvedValue({
      id: REPORT_ID,
      userId: USER_ID,
      reportContent: { summary: "Summary" },
    } as never);

    const res = await request(app).post("/api/ai-reports/generate").send({
      startDate: "2026-06-01",
      endDate: "2026-06-30",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe(REPORT_ID);
    expect(mockAiReportService.generate).toHaveBeenCalledWith({
      userId: USER_ID,
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      reportType: "physician_ready",
      language: "en",
    });
  });

  it("passes reportType when provided", async () => {
    mockAiReportService.generate.mockResolvedValue({
      id: REPORT_ID,
    } as never);

    const res = await request(app).post("/api/ai-reports/generate").send({
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      reportType: "clinic_summary",
    });

    expect(res.status).toBe(201);
    expect(mockAiReportService.generate).toHaveBeenCalledWith({
      userId: USER_ID,
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      reportType: "clinic_summary",
      language: "en",
    });
  });

  it("returns 422 when startDate is missing", async () => {
    const res = await request(app).post("/api/ai-reports/generate").send({
      endDate: "2026-06-30",
    });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("startDate");
  });

  it("returns 422 when startDate is in the future", async () => {
    const res = await request(app).post("/api/ai-reports/generate").send({
      startDate: "2999-01-01",
      endDate: "2999-01-31",
    });

    expect(res.status).toBe(422);
  });

  it("returns 422 when startDate is after endDate", async () => {
    const res = await request(app).post("/api/ai-reports/generate").send({
      startDate: "2026-06-30",
      endDate: "2026-06-01",
    });

    expect(res.status).toBe(422);
  });

  it("returns 422 when the date range exceeds 366 days", async () => {
    const res = await request(app).post("/api/ai-reports/generate").send({
      startDate: "2024-01-01",
      endDate: "2026-01-31",
    });

    expect(res.status).toBe(422);
  });

  it("returns 502 when the AI generation fails", async () => {
    mockAiReportService.generate.mockRejectedValue(
      createError("Failed to generate AI report", 502),
    );

    const res = await request(app).post("/api/ai-reports/generate").send({
      startDate: "2026-06-01",
      endDate: "2026-06-30",
    });

    expect(res.status).toBe(502);
  });
});

describe("GET /api/ai-reports/:id", () => {
  it("returns 200 with the report", async () => {
    mockAiReportService.getById.mockResolvedValue({
      id: REPORT_ID,
      userId: USER_ID,
    } as never);

    const res = await request(app).get(`/api/ai-reports/${REPORT_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(REPORT_ID);
    expect(mockAiReportService.getById).toHaveBeenCalledWith(
      USER_ID,
      REPORT_ID,
    );
  });

  it("returns 422 when id is not a uuid", async () => {
    const res = await request(app).get("/api/ai-reports/not-a-uuid");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("id");
  });

  it("returns 404 when the report is not found", async () => {
    mockAiReportService.getById.mockRejectedValue(
      createError("AI report not found", 404),
    );

    const res = await request(app).get(`/api/ai-reports/${REPORT_ID}`);

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/ai-reports/:id", () => {
  it("returns 200 with a deleted result", async () => {
    mockAiReportService.remove.mockResolvedValue({
      id: REPORT_ID,
      message: "Report deleted",
    });

    const res = await request(app).delete(`/api/ai-reports/${REPORT_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ id: REPORT_ID, message: "Report deleted" });
    expect(mockAiReportService.remove).toHaveBeenCalledWith(USER_ID, REPORT_ID);
  });

  it("returns 422 when id is not a uuid", async () => {
    const res = await request(app).delete("/api/ai-reports/not-a-uuid");

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("id");
  });

  it("returns 404 when the report is not found", async () => {
    mockAiReportService.remove.mockRejectedValue(
      createError("AI report not found", 404),
    );

    const res = await request(app).delete(`/api/ai-reports/${REPORT_ID}`);

    expect(res.status).toBe(404);
  });
});
