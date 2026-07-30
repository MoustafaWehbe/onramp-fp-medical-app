import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { clearAuthCookies } from "../utils/cookies";

export const usersController = {
  async updateEmail(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { currentPassword, newEmail } = req.body;
      const user = await authService.updateEmail(
        req.user!.userId,
        currentPassword,
        newEmail,
      );
      res.json({
        data: { message: "Email updated successfully.", email: user.email },
      });
    } catch (err) {
      next(err);
    }
  },

  async updatePassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.updatePassword(
        req.user!.userId,
        currentPassword,
        newPassword,
      );
      res.json({
        data: { message: "Password updated successfully." },
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteMe(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { currentPassword } = req.body;
      await authService.deleteAccount(req.user!.userId, currentPassword);
      clearAuthCookies(res);
      res.json({
        data: { message: "Account deleted successfully." },
      });
    } catch (err) {
      next(err);
    }
  },
};
