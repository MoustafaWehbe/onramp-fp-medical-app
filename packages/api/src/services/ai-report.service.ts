import { Op } from "sequelize";
import { chatCompletion } from "../lib/ai";
import { AiReport } from "../models";
import {
  buildPaginatedResponse,
  getPaginationParams,
} from "../lib/pagination";
import { createError } from "../middleware/error-handler";
import { collectReportData } from "./ai-report/data-collector";
import type {
  GenerateAiReportInput,
  ListAiReportsInput,
} from "./ai-report/types";

export type {
  GenerateAiReportInput,
  ListAiReportsInput,
} from "./ai-report/types";

interface GeneratedReportContent {
  summary?: string;
  conditions?: string[];
  medications?: string[];
  symptoms?: string[];
  recommendations?: string[];
  reportType?: string;
  [key: string]: unknown;
}

const SYSTEM_PROMPT = `You are a clinical health assistant generating a physician-ready patient report.
Given the patient's daily log entries and active profile data for a date range, respond with a JSON object that has exactly these keys:
- summary: string — concise clinical overview of the period
- conditions: string[] — conditions relevant to the period
- medications: string[] — medications relevant to the period
- symptoms: string[] — symptoms observed during the period
- recommendations: string[] — actionable recommendations for the clinician or patient

Use only information present in the provided data. If a category has no data, return an empty array. Do not invent medical facts.`;

async function findOwnedReport(userId: string, id: string) {
  const report = await AiReport.findOne({
    where: { id, userId },
  });

  if (!report) {
    throw createError("AI report not found", 404);
  }

  return report;
}

function parseReportContent(raw: string): GeneratedReportContent {
  try {
    const parsed = JSON.parse(raw) as GeneratedReportContent;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Report content is not an object");
    }
    return parsed;
  } catch {
    throw createError("Failed to generate AI report", 502);
  }
}

export class AiReportService {
  async list(input: ListAiReportsInput) {
    const { currentPage, pageSize, offset, limit } = getPaginationParams(input);
    const where = { userId: input.userId };

    const count = await AiReport.count({ where });

    const pageIds = await AiReport.findAll({
      where,
      attributes: ["id"],
      order: [
        ["dateRangeEnd", "DESC"],
        ["id", "ASC"],
      ],
      limit,
      offset,
    });

    const ids = pageIds.map((row) => row.id);
    if (ids.length === 0) {
      return buildPaginatedResponse([], count, currentPage, pageSize);
    }

    const rows = await AiReport.findAll({
      where: {
        ...where,
        id: { [Op.in]: ids },
      },
      order: [
        ["dateRangeEnd", "DESC"],
        ["id", "ASC"],
      ],
    });

    return buildPaginatedResponse(rows, count, currentPage, pageSize);
  }

  async getById(userId: string, id: string) {
    return findOwnedReport(userId, id);
  }

  async remove(userId: string, id: string) {
    const report = await findOwnedReport(userId, id);
    await report.destroy();
    return { id, message: "Report deleted" };
  }

  async generate(input: GenerateAiReportInput) {
    const context = await collectReportData(
      input.userId,
      input.startDate,
      input.endDate,
    );

    let raw: string;
    try {
      raw = await chatCompletion(
        [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: JSON.stringify({
              reportType: input.reportType,
              ...context,
            }),
          },
        ],
        { response_format: { type: "json_object" } },
      );
    } catch {
      throw createError("Failed to generate AI report", 502);
    }

    const reportContent = parseReportContent(raw);
    reportContent.reportType = input.reportType;

    return AiReport.create({
      userId: input.userId,
      dateRangeStart: input.startDate,
      dateRangeEnd: input.endDate,
      reportContent,
    });
  }
}

export const aiReportService = new AiReportService();
