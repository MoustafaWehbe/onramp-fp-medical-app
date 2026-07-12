import type { Request, Response, NextFunction } from "express";
import { symptomCatalogService } from "../services/symptom.service";

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
};
