import type { Request, Response, NextFunction } from "express";
import { analyticsService } from "../services/analytics.service";

export const analyticsController = {
  async dashboard(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { days } = req.query as unknown as {
        days?: number;
      };
      const result = await analyticsService.getDashboard({
        userId: req.user!.userId,
        days,
      });

      res.json({
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};