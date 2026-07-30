import { Op, fn, col, literal } from "sequelize";
import {
  DailyEntry,
  EntrySymptom,
  UserSymptom,
  SymptomCatalog,
} from "../models";

export interface AnalyticsDashboardInput {
  userId: string;
  days?: number;
}

export interface MoodTrendItem {
  date: string;
  value: number | null;
}

export interface SleepTrendItem {
  date: string;
  hours: number | null;
}

export interface SymptomFrequencyItem {
  symptom: string;
  count: number;
}

function getStartDate(days: number): string {
  const date = new Date();

  date.setDate(date.getDate() - days);

  return date.toISOString().split("T")[0];
}

export class AnalyticsService {
  async getDashboard(input: AnalyticsDashboardInput) {
    const days = input.days ?? 30;

    const [
      moodTrend,
      sleepTrend,
      symptomFrequency,
    ] = await Promise.all([
      this.getMoodTrend(input.userId, days),
      this.getSleepTrend(input.userId, days),
      this.getSymptomFrequency(input.userId, days),
    ]);

    return {
      period: days,
      moodTrend,
      sleepTrend,
      symptomFrequency,
    };
  }

  async getMoodTrend(
    userId: string,
    days = 30,
  ): Promise<MoodTrendItem[]> {
    const startDate = getStartDate(days);

    const entries = await DailyEntry.findAll({
      where: {
        userId,
        entryDate: {
          [Op.gte]: startDate,
        },
      },
      attributes: [
        "entryDate",
        "moodRating",
      ],
      order: [
        ["entryDate", "ASC"],
      ],
    });

    return entries.map((entry) => ({
      date: entry.entryDate,
      value: entry.moodRating ?? null,
    }));
  }

  async getSleepTrend(
    userId: string,
    days = 30,
  ): Promise<SleepTrendItem[]> {
    const startDate = getStartDate(days);

    const entries = await DailyEntry.findAll({
      where: {
        userId,
        entryDate: {
          [Op.gte]: startDate,
        },
      },
      attributes: [
        "entryDate",
        "sleepHours",
      ],
      order: [
        ["entryDate", "ASC"],
      ],
    });

    return entries.map((entry) => ({
      date: entry.entryDate,
      hours: entry.sleepHours ?? null,
    }));
  }

  async getSymptomFrequency(
    userId: string,
    days = 30,
  ): Promise<SymptomFrequencyItem[]> {
    const startDate = getStartDate(days);

    const symptoms = await EntrySymptom.findAll({
      attributes: [
        [
          fn(
            "COUNT",
            col("EntrySymptom.id"),
          ),
          "count",
        ],
      ],
      include: [
        {
          model: DailyEntry,
          as: "entry",
          attributes: [],
          required: true,
          where: {
            userId,
            entryDate: {
              [Op.gte]: startDate,
            },
          },
        },
        {
          model: UserSymptom,
          as: "userSymptom",
          attributes: [],
          required: true,
          include: [
            {
              model: SymptomCatalog,
              as: "catalog",
              attributes: [
                "name",
              ],
              required: true,
            },
          ],
        },
      ],
      group: [
        "userSymptom.catalog.id",
        "userSymptom.catalog.name",
      ],
      order: [
        [
          literal("count"),
          "DESC",
        ],
      ],
      raw: true,
    });


    return symptoms.map(
      (item: any) => ({
        symptom:
          item["userSymptom.catalog.name"],
        count: Number(item.count),
      }),
    );
  }
}

export const analyticsService =
  new AnalyticsService();