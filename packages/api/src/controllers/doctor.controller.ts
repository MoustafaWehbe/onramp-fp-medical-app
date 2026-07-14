import type { Request, Response, NextFunction } from "express";
import { doctorService } from "../services/doctor.service";

export const doctorController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPage, pageSize, search } = req.query as unknown as {
        currentPage: number;
        pageSize: number;
        search?: string;
      };
      const result = await doctorService.list({
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
      const doctor = await doctorService.create(req.body);
      res.status(201).json({ data: doctor });
    } catch (err) {
      next(err);
    }
  },
};
