import type { Request, Response, NextFunction } from "express";

import { reminderSettingsService } from "../services/reminder-settings.service";

export const reminderSettingsController = {
  async getSettings(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const settings = await reminderSettingsService.getSettings(
        req.user!.userId,
      );

      res.json({
        data: settings,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateSettings(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const settings = await reminderSettingsService.updateSettings(
        req.user!.userId,
        req.body,
      );

      res.json({
        data: settings,
      });
    } catch (err) {
      next(err);
    }
  },
};
