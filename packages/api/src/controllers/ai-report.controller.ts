import { Request, Response, NextFunction } from "express";
import { aiReportService } from "../services/ai-report.service";

export const AiReportController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPage, pageSize } = req.query as unknown as {
        currentPage: number;
        pageSize: number;
      };

      const result = await aiReportService.list({
        userId: req.user!.userId,
        currentPage,
        pageSize,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async generate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const report = await aiReportService.generate({
        userId: req.user!.userId,
        ...req.body,
      });
      res.status(201).json({ data: report });
    } catch (err) {
      next(err);
    }
  },

  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const report = await aiReportService.getById(req.user!.userId, id);
      res.json({ data: report });
    } catch (err) {
      next(err);
    }
  },

  async remove(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const result = await aiReportService.remove(req.user!.userId, id);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },
};
