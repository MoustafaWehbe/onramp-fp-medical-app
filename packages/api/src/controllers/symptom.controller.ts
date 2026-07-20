import type { Request, Response, NextFunction } from "express";
import { symptomCatalogService } from "../services/symptom.service";
import { userSymptomService } from "../services/user-symptom.service";

export const symptomCatalogController = {
  async list(
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
      const result = await symptomCatalogService.list({
        currentPage,
        pageSize,
        search,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const symptom = await symptomCatalogService.create(req.body);
      res.status(201).json({ data: symptom });
    } catch (err) {
      next(err);
    }
  },

  async searchSymptomsOnline(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { search } = req.query as unknown as { search: string };
      const names = await symptomCatalogService.searchSymptomsOnline(search);
      res.json(names);
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
      const result = await userSymptomService.list({
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
      const userSymptom = await userSymptomService.getById(
        req.user!.userId,
        id,
      );
      res.json({ data: userSymptom });
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
      const userSymptom = await userSymptomService.create({
        userId: req.user!.userId,
        ...req.body,
      });
      res.status(201).json({ data: userSymptom });
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
      const result = await userSymptomService.remove(req.user!.userId, id);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },
};
