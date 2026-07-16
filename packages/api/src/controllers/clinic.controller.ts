import type { Request, Response, NextFunction } from "express";
import { clinicService } from "../services/clinic.service";

export const clinicController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPage, pageSize, search } = req.query as unknown as {
        currentPage: number;
        pageSize: number;
        search?: string;
      };
      const result = await clinicService.list({
        currentPage,
        pageSize,
        search,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clinic = await clinicService.create(req.body);
      res.status(201).json({ data: clinic });
    } catch (err) {
      next(err);
    }
  },
};
