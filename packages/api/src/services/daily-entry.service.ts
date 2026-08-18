import { Op } from "sequelize";
import {
  DailyEntry,
  EntryDoctorVisit,
  EntryMedication,
  EntrySymptom,
} from "../models";
import {
  buildPaginatedResponse,
  getPaginationParams,
} from "../lib/pagination";
import { createError } from "../middleware/error-handler";
import { getDatabase } from "../lib/db";
import { entryIncludes } from "./daily-entry/includes";
import { assertOwnedReferences } from "./daily-entry/ownership";
import {
  insertChildren,
  reconcileConditions,
  rethrowUnique,
} from "./daily-entry/children";
import type {
  CreateDailyEntryInput,
  ListDailyEntriesInput,
  UpdateDailyEntryInput,
} from "./daily-entry/types";

export type {
  EntrySymptomInput,
  EntryConditionInput,
  EntryMedicationInput,
  EntryDoctorVisitInput,
  CreateDailyEntryInput,
  UpdateDailyEntryInput,
  ListDailyEntriesInput,
} from "./daily-entry/types";

async function findOwnedEntry(userId: string, id: string) {
  const entry = await DailyEntry.findOne({
    where: { id, userId },
    include: entryIncludes(),
  });

  if (!entry) {
    throw createError("Daily entry not found", 404);
  }

  return entry;
}

export class DailyEntryService {
  async list(input: ListDailyEntriesInput) {
    const { currentPage, pageSize, offset, limit } = getPaginationParams(input);

    const where: Record<string, unknown> = { userId: input.userId };

    if (input.fromDate && input.toDate) {
      where.entryDate = { [Op.between]: [input.fromDate, input.toDate] };
    } else if (input.fromDate) {
      where.entryDate = { [Op.gte]: input.fromDate };
    } else if (input.toDate) {
      where.entryDate = { [Op.lte]: input.toDate };
    }

    const count = await DailyEntry.count({
      where,
    });

    const paginatedEntries =
    await DailyEntry.findAll({
      where,

      attributes: ["id"],

      order: [
        ["entryDate", "DESC"],
        ["id", "ASC"],
      ],

      limit,
      offset,
    });

    const entryIds =
      paginatedEntries.map(
        (entry) => entry.id,
      );
    if (entryIds.length === 0) {
        return buildPaginatedResponse(
          [],
          count,
          currentPage,
          pageSize,
        );
    }
    const rows = await DailyEntry.findAll({
      where: {
        ...where,
        id: {
          [Op.in]: entryIds,
        },
      },

    include: entryIncludes(),

    order: [
      ["entryDate", "DESC"],
      ["id", "ASC"],
    ],
  });
    return buildPaginatedResponse(rows, count, currentPage, pageSize);
  }

  async getById(userId: string, id: string) {
    return findOwnedEntry(userId, id);
  }

  async create(input: CreateDailyEntryInput) {
    const sequelize = getDatabase();

    const entryId = await sequelize.transaction(async (transaction) => {
      await assertOwnedReferences(input, input.userId, transaction);

      let entry: DailyEntry;
      try {
        entry = await DailyEntry.create(
          {
            userId: input.userId,
            entryDate: input.entryDate,
            moodRating: input.moodRating ?? undefined,
            sleepHours: input.sleepHours ?? undefined,
            journalNotes: input.journalNotes ?? undefined,
          },
          { transaction },
        );
      } catch (error) {
        rethrowUnique(error, "Daily entry already exists for this date");
      }

      await reconcileConditions(entry.id, input.conditions ?? [], transaction);
      await insertChildren(entry.id, input, transaction);

      return entry.id;
    });

    return findOwnedEntry(input.userId, entryId);
  }

  async update(input: UpdateDailyEntryInput) {
    const sequelize = getDatabase();

    await sequelize.transaction(async (transaction) => {
      const entry = await DailyEntry.findOne({
        where: { id: input.id, userId: input.userId },
        transaction,
      });

      if (!entry) {
        throw createError("Daily entry not found", 404);
      }

      await assertOwnedReferences(input, input.userId, transaction);

      if (input.entryDate !== undefined) {
        entry.set("entryDate", input.entryDate);
      }
      if (input.moodRating !== undefined) {
        entry.set("moodRating", input.moodRating as number | undefined);
      }
      if (input.sleepHours !== undefined) {
        entry.set("sleepHours", input.sleepHours as number | undefined);
      }
      if (input.journalNotes !== undefined) {
        entry.set("journalNotes", input.journalNotes as string | undefined);
      }

      try {
        await entry.save({ transaction });
      } catch (error) {
        rethrowUnique(error, "Daily entry already exists for this date");
      }

      if (input.symptoms !== undefined) {
        await EntrySymptom.destroy({
          where: { entryId: entry.id },
          transaction,
        });
      }
      if (input.conditions !== undefined) {
        await reconcileConditions(entry.id, input.conditions, transaction);
      }
      if (input.medications !== undefined) {
        await EntryMedication.destroy({
          where: { entryId: entry.id },
          transaction,
        });
      }
      if (input.doctorVisits !== undefined) {
        await EntryDoctorVisit.destroy({
          where: { entryId: entry.id },
          transaction,
        });
      }

      await insertChildren(entry.id, input, transaction);
    });

    return findOwnedEntry(input.userId, input.id);
  }

  async remove(userId: string, id: string) {
    const entry = await DailyEntry.findOne({ where: { id, userId } });

    if (!entry) {
      throw createError("Daily entry not found", 404);
    }

    await entry.destroy();

    return { id, message: "Deleted" };
  }
}

export const dailyEntryService = new DailyEntryService();
