import { Request, Response, NextFunction } from "express";
import { entryDoctorVisitService } from "../services/entry-doctor-visit.service";

export const EntryDoctorVisitController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPage, pageSize } = req.query as unknown as {
        currentPage: number;
        pageSize: number;
      };

      const result = await entryDoctorVisitService.list({
        userId: req.user!.userId,
        currentPage,
        pageSize,
      });

      res.json(result);
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

      const doctorVisit = await entryDoctorVisitService.getById(
        req.user!.userId,
        id,
      );

      res.json({ data: doctorVisit });
    } catch (err) {
      next(err);
    }
  },
};