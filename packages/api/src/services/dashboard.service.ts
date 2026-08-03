import { Op, fn, col } from "sequelize";
import {
  DailyEntry,
  EntryDoctorVisit,
  UserDoctor,
  UserClinic,
  UserMedication,
  UserCondition,
  Doctor,
  Clinic,
} from "../models";

export interface DashboardStats {
  entryCount: number;
  activeMedicationCount: number;
  activeConditionCount: number;
  avgMood: number | null;
}

export interface RecentEntryItem {
  id: string;
  entryDate: string;
  moodRating: number | null;
  sleepHours: number | null;
  journalSnippet: string | null;
}

export interface LastVisitItem {
  date: string;
  doctorName: string;
  clinicName: string | null;
  summary: string | null;
}

export interface DashboardData {
  stats: DashboardStats;
  recentEntries: RecentEntryItem[];
  lastVisit: LastVisitItem | null;
}

function getDateRange(days: number) {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

export class DashboardService {
  async getDashboard(userId: string): Promise<DashboardData> {
    const [
      entryCount,
      activeMedicationCount,
      activeConditionCount,
      avgMood,
      lastVisit,
      recentEntries,
    ] = await Promise.all([
      this.getEntryCount(userId, 30),
      this.getActiveMedicationCount(userId),
      this.getActiveConditionCount(userId),
      this.getAvgMood(userId, 7),
      this.getLastVisit(userId),
      this.getRecentEntries(userId, 5),
    ]);

    return {
      stats: {
        entryCount,
        activeMedicationCount,
        activeConditionCount,
        avgMood,
      },
      recentEntries,
      lastVisit,
    };
  }

  private async getEntryCount(
    userId: string,
    days: number,
  ): Promise<number> {
    const { startDate, endDate } = getDateRange(days);

    return DailyEntry.count({
      where: {
        userId,
        entryDate: {
          [Op.between]: [startDate, endDate],
        },
      },
    });
  }

  private async getActiveMedicationCount(
    userId: string,
  ): Promise<number> {
    return UserMedication.count({
      where: {
        userId,
        active: true,
      },
    });
  }

  private async getActiveConditionCount(
    userId: string,
  ): Promise<number> {
    return UserCondition.count({
      where: {
        userId,
        active: true,
      },
    });
  }

  private async getAvgMood(
    userId: string,
    days: number,
  ): Promise<number | null> {
    const { startDate, endDate } = getDateRange(days);

    const result = await DailyEntry.findOne({
      where: {
        userId,
        entryDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: [
        [fn("AVG", col("mood_rating")), "avgMood"],
      ],
      raw: true,
    });

    if (!result || (result as any).avgMood === null) {
      return null;
    }

    return Math.round(((result as any).avgMood as number) * 10) / 10;
  }

  private async getRecentEntries(
    userId: string,
    limit: number,
  ): Promise<RecentEntryItem[]> {
    const entries = await DailyEntry.findAll({
      where: { userId },
      attributes: [
        "id",
        "entryDate",
        "moodRating",
        "sleepHours",
        "journalNotes",
      ],
      order: [["entryDate", "DESC"]],
      limit,
    });

    return entries.map((entry) => ({
      id: entry.id,
      entryDate: entry.entryDate,
      moodRating: entry.moodRating ?? null,
      sleepHours: entry.sleepHours ?? null,
      journalSnippet: entry.journalNotes
        ? entry.journalNotes.slice(0, 120)
        : null,
    }));
  }

  private async getLastVisit(
    userId: string,
  ): Promise<LastVisitItem | null> {
    const visit = await EntryDoctorVisit.findOne({
      include: [
        {
          model: DailyEntry,
          as: "entry",
          attributes: ["entryDate"],
          required: true,
          where: { userId },
        },
        {
          model: UserDoctor,
          as: "userDoctor",
          required: true,
          where: { userId },
          include: [
            {
              model: Doctor,
              as: "doctor",
              attributes: ["name"],
            },
          ],
        },
        {
          model: UserClinic,
          as: "userClinic",
          required: false,
          include: [
            {
              model: Clinic,
              as: "clinic",
              attributes: ["name"],
            },
          ],
        },
      ],
      order: [
        [{ model: DailyEntry, as: "entry" }, "entryDate", "DESC"],
      ],
    });

    if (!visit) {
      return null;
    }

    const v = visit as any;
    const entry = v.entry;
    const userDoctor = v.userDoctor;
    const userClinic = v.userClinic;

    return {
      date: entry.entryDate,
      doctorName: userDoctor?.doctor?.name ?? "Unknown",
      clinicName: userClinic?.clinic?.name ?? null,
      summary: v.summary ?? null,
    };
  }
}

export const dashboardService = new DashboardService();
