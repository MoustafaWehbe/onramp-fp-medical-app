import type { Request, Response, NextFunction } from "express";
import { dashboardService } from "../services/dashboard.service";

export const dashboardController = {
  async getDashboard(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await dashboardService.getDashboard(
        req.user!.userId,
      );

      res.json({
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
