import { DailyEntry, EntryDoctorVisit, UserDoctor, UserClinic } from "../models";
import {
  buildPaginatedResponse,
  getPaginationParams,
  type PaginationInput,
} from "../lib/pagination";
import { createError } from "../middleware/error-handler";

export interface ListEntryDoctorVisitsInput extends PaginationInput {
  userId: string;
}


async function findOwnedDoctorVisit(userId: string, id: string) {
  const doctorVisit = await EntryDoctorVisit.findOne({
    where: { id },
    include: [
      {
        model: DailyEntry,
        as: "entry",
        where: { userId },
        attributes: ["id", "entryDate"],
      },
      {
        model: UserDoctor,
        as: "userDoctor",
        include: [
          {
            association: "doctor",
            attributes: ["id", "name", "specialty"],
          },
        ],
      },
      {
        model: UserClinic,
        as: "userClinic",
        include: [
          {
            association: "clinic",
            attributes: ["id", "name", "address"],
          },
        ],
        required: false,
      },
    ],
  });

  if (!doctorVisit) {
    throw createError("Doctor visit not found", 404);
  }

  return doctorVisit;
}

export class EntryDoctorVisitService {
  async list(input: ListEntryDoctorVisitsInput) {
    const { currentPage, pageSize, offset, limit } =
      getPaginationParams(input);

    const { count, rows } = await EntryDoctorVisit.findAndCountAll({
      include: [
        {
          model: DailyEntry,
          as: "entry",
          where: { userId: input.userId },
          attributes: ["id", "entryDate"],
        },
        {
          model: UserDoctor,
          as: "userDoctor",
          include: [
            {
              association: "doctor",
              attributes: ["id", "name", "specialty"],
            },
          ],
        },
        {
          model: UserClinic,
          as: "userClinic",
          include: [
            {
              association: "clinic",
              attributes: ["id", "name", "address"],
            },
          ],
          required: false,
        },
      ],
      order: [
        [{ model: DailyEntry, as: "entry" }, "entryDate", "DESC"],
        ["createdAt", "DESC"],
        ["id", "ASC"],
      ],
      limit,
      offset,
      distinct: true,
    });

    return buildPaginatedResponse(
      rows,
      count,
      currentPage,
      pageSize,
    );
  }

  async getById(userId: string, id: string) {
    return findOwnedDoctorVisit(userId, id);
  }
}

export const entryDoctorVisitService =
  new EntryDoctorVisitService();