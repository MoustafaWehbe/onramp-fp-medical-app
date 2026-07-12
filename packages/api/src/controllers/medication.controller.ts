import type { Request, Response, NextFunction } from "express";
import { medicationService } from "../services/medication.service";

export const medicationController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPage, pageSize, search } = req.query as unknown as {
        currentPage: number;
        pageSize: number;
        search?: string;
      };
      const result = await medicationService.list({
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
      const medication = await medicationService.create(req.body);
      res.status(201).json({ data: medication });
    } catch (err) {
      next(err);
    }
  },

  async searchMedicationsOnline(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { search } = req.query as unknown as { search: string };
      const names = await medicationService.searchNames(search);
      res.json(names);
    } catch (err) {
      next(err);
    }
  },

  async lookupCategoryOnline(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { name } = req.query as unknown as { name: string };
      const category = await medicationService.lookupCategoryOnline(name);
      res.json(category);
    } catch (err) {
      next(err);
    }
  },
};
