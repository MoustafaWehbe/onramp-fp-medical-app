import { Op } from "sequelize";
import { AiReport } from "../../src/models";
import { chatCompletion } from "../../src/lib/ai";
import { collectReportData } from "../../src/services/ai-report/data-collector";
import {
  aiReportService,
  AiReportService,
} from "../../src/services/ai-report.service";

jest.mock("../../src/lib/ai", () => ({
  chatCompletion: jest.fn(),
}));

jest.mock("../../src/models", () => ({
  AiReport: {
    count: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../../src/services/ai-report/data-collector", () => ({
  collectReportData: jest.fn(),
}));

const mockAiReport = AiReport as jest.Mocked<typeof AiReport>;
const mockChatCompletion = chatCompletion as jest.MockedFunction<
  typeof chatCompletion
>;
const mockCollectReportData = collectReportData as jest.MockedFunction<
  typeof collectReportData
>;
const service = new AiReportService();

const userId = "00000000-0000-0000-0000-000000000001";
const reportRow = {
  id: "report-1",
  userId,
  dateRangeStart: "2026-01-01",
  dateRangeEnd: "2026-01-07",
  reportContent: { summary: "Overview", reportType: "weekly" },
};

const VALID_JSON = JSON.stringify({
  summary: "Clinical overview",
  conditions: ["Hay fever"],
  medications: [],
  symptoms: ["Sneezing"],
  recommendations: ["Avoid pollen"],
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── list ─────────────────────────────────────────────────────────────────────

describe("AiReportService.list", () => {
  it("returns a paginated list ordered by date range", async () => {
    mockAiReport.count.mockResolvedValue(2);
    mockAiReport.findAll
      .mockResolvedValueOnce([{ id: "report-1" }, { id: "report-2" }])
      .mockResolvedValueOnce([reportRow, { ...reportRow, id: "report-2" }]);

    const result = await service.list({ userId, currentPage: 1, pageSize: 10 });

    expect(mockAiReport.count).toHaveBeenCalledWith({ where: { userId } });
    expect(mockAiReport.findAll).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { userId },
        attributes: ["id"],
        order: [
          ["dateRangeEnd", "DESC"],
          ["id", "ASC"],
        ],
        limit: 10,
        offset: 0,
      }),
    );
    expect(mockAiReport.findAll).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: {
          userId,
          id: { [Op.in]: ["report-1", "report-2"] },
        },
        order: [
          ["dateRangeEnd", "DESC"],
          ["id", "ASC"],
        ],
      }),
    );
    expect(result.data).toHaveLength(2);
  });

  it("returns an empty page when no reports match", async () => {
    mockAiReport.count.mockResolvedValue(5);
    mockAiReport.findAll.mockResolvedValue([]);

    const result = await service.list({ userId, currentPage: 1, pageSize: 10 });

    expect(mockAiReport.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      data: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalCount: 5,
        totalPages: 1,
      },
    });
  });
});

// ─── getById ──────────────────────────────────────────────────────────────────

describe("AiReportService.getById", () => {
  it("returns the report when found", async () => {
    mockAiReport.findOne.mockResolvedValue(reportRow);

    const result = await service.getById(userId, "report-1");

    expect(mockAiReport.findOne).toHaveBeenCalledWith({
      where: { id: "report-1", userId },
    });
    expect(result).toEqual(reportRow);
  });

  it("throws 404 when the report is not found", async () => {
    mockAiReport.findOne.mockResolvedValue(null);

    const error = await service.getById(userId, "missing").catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "AI report not found",
      statusCode: 404,
    });
  });
});

// ─── remove ───────────────────────────────────────────────────────────────────

describe("AiReportService.remove", () => {
  it("destroys the report and returns a deleted message", async () => {
    const report = {
      id: "report-1",
      destroy: jest.fn().mockResolvedValue(undefined),
    };
    mockAiReport.findOne.mockResolvedValue(report);

    const result = await service.remove(userId, "report-1");

    expect(report.destroy).toHaveBeenCalled();
    expect(result).toEqual({ id: "report-1", message: "Report deleted" });
  });

  it("throws 404 when the report is not found", async () => {
    mockAiReport.findOne.mockResolvedValue(null);

    const error = await service.remove(userId, "missing").catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "AI report not found",
      statusCode: 404,
    });
  });
});

// ─── generate ─────────────────────────────────────────────────────────────────

describe("AiReportService.generate", () => {
  const input = {
    userId,
    startDate: "2026-01-01",
    endDate: "2026-01-07",
    reportType: "weekly",
  };

  it("creates a report from the collected data and AI response", async () => {
    mockCollectReportData.mockResolvedValue({
      dateRange: { startDate: "2026-01-01", endDate: "2026-01-07" },
      entries: [],
      activeConditions: [],
      activeMedications: [],
      activeSymptoms: [],
    });
    mockChatCompletion.mockResolvedValue(VALID_JSON);
    mockAiReport.create.mockResolvedValue(reportRow as never);

    const result = await service.generate(input);

    expect(mockCollectReportData).toHaveBeenCalledWith(
      userId,
      "2026-01-01",
      "2026-01-07",
    );
    expect(mockChatCompletion).toHaveBeenCalledWith(
      expect.arrayContaining([
        { role: "system", content: expect.any(String) },
        { role: "user", content: expect.any(String) },
      ]),
      { response_format: { type: "json_object" } },
    );
    expect(mockAiReport.create).toHaveBeenCalledWith({
      userId,
      dateRangeStart: "2026-01-01",
      dateRangeEnd: "2026-01-07",
      reportContent: expect.objectContaining({
        summary: "Clinical overview",
        conditions: ["Hay fever"],
        symptoms: ["Sneezing"],
        recommendations: ["Avoid pollen"],
        reportType: "weekly",
      }),
    });
    expect(result).toEqual(reportRow);
  });

  it("throws 502 when chatCompletion rejects", async () => {
    mockCollectReportData.mockResolvedValue({} as never);
    mockChatCompletion.mockRejectedValue(new Error("ai down"));

    const error = await service.generate(input).catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Failed to generate AI report",
      statusCode: 502,
    });
  });

  it("throws 502 when the AI returns invalid JSON", async () => {
    mockCollectReportData.mockResolvedValue({} as never);
    mockChatCompletion.mockResolvedValue("not-json");

    const error = await service.generate(input).catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Failed to generate AI report",
      statusCode: 502,
    });
  });

  it("throws 502 when the parsed content is not an object", async () => {
    mockCollectReportData.mockResolvedValue({} as never);
    mockChatCompletion.mockResolvedValue("[1, 2, 3]");

    const error = await service.generate(input).catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Failed to generate AI report",
      statusCode: 502,
    });
  });

  it("throws 502 when list keys are not string arrays", async () => {
    mockCollectReportData.mockResolvedValue({} as never);
    mockChatCompletion.mockResolvedValue(
      JSON.stringify({
        summary: "Overview",
        conditions: "not-an-array",
        medications: [],
        symptoms: [],
        recommendations: [],
      }),
    );

    const error = await service.generate(input).catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Failed to generate AI report",
      statusCode: 502,
    });
  });

  it("throws 502 when the summary is not a string", async () => {
    mockCollectReportData.mockResolvedValue({} as never);
    mockChatCompletion.mockResolvedValue(
      JSON.stringify({
        summary: 42,
        conditions: [],
        medications: [],
        symptoms: [],
        recommendations: [],
      }),
    );

    const error = await service.generate(input).catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Failed to generate AI report",
      statusCode: 502,
    });
  });
});