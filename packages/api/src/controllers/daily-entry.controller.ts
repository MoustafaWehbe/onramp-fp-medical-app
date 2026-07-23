import { Request, Response, NextFunction } from "express";
import { dailyEntryService } from "../services/daily-entry.service";

export const DailyEntryController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPage, pageSize, fromDate, toDate } =
        req.query as unknown as {
          currentPage: number;
          pageSize: number;
          fromDate?: string;
          toDate?: string;
        };

      const result = await dailyEntryService.list({
        userId: req.user!.userId,
        currentPage,
        pageSize,
        fromDate,
        toDate,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const entry = await dailyEntryService.getById(req.user!.userId, id);
      res.json({ data: entry });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await dailyEntryService.create({
        userId: req.user!.userId,
        ...req.body,
      });
      res.status(201).json({ data: entry });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const entry = await dailyEntryService.update({
        userId: req.user!.userId,
        id,
        ...req.body,
      });
      res.json({ data: entry });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const result = await dailyEntryService.remove(req.user!.userId, id);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },
};
