import type { Request, Response, NextFunction } from "express";
import { doctorService } from "../services/doctor.service";
import { userDoctorService } from "../services/user-doctor.service";

export const doctorController = {
  // ── Catalog (/api/doctors) ─────────────────────────────────────────────────

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

  // ── Profile (/api/profile/doctors) ─────────────────────────────────────────

  async listProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { currentPage, pageSize, search } = req.query as unknown as {
        currentPage: number;
        pageSize: number;
        search?: string;
      };
      const result = await userDoctorService.list({
        userId: req.user!.userId,
        currentPage,
        pageSize,
        search,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getProfileById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const userDoctor = await userDoctorService.getById(req.user!.userId, id);
      res.json({ data: userDoctor });
    } catch (err) {
      next(err);
    }
  },

  async createProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userDoctor = await userDoctorService.create({
        userId: req.user!.userId,
        ...req.body,
      });
      res.status(201).json({ data: userDoctor });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const userDoctor = await userDoctorService.update({
        userId: req.user!.userId,
        id,
        ...req.body,
      });
      res.json({ data: userDoctor });
    } catch (err) {
      next(err);
    }
  },

  async removeProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const result = await userDoctorService.remove(req.user!.userId, id);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },
};
