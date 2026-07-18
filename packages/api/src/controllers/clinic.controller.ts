import type { Request, Response, NextFunction } from "express";
import { clinicService } from "../services/clinic.service";
import { userClinicService } from "../services/user-clinic.service";

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
      const result = await userClinicService.list({
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
      const userClinic = await userClinicService.getById(
        req.user!.userId,
        id,
      );
      res.json({ data: userClinic });
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
      const userClinic = await userClinicService.create({
        ...req.body,
        userId: req.user!.userId,
      });
      res.status(201).json({ data: userClinic });
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
      const userClinic = await userClinicService.update({
        userId: req.user!.userId,
        id,
        ...req.body,
      });
      res.json({ data: userClinic });
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
      const result = await userClinicService.remove(
        req.user!.userId,
        id,
      );
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },
};
