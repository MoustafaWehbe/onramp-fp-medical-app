import type { Request, Response, NextFunction } from "express";
import { symptomCatalogService } from "../services/symptom.service";

export const symptomCatalogController = {
  async list(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const symptoms = await symptomCatalogService.list();
      res.json({ data: symptoms });
    } catch (err) {
      next(err);
    }
  }
}