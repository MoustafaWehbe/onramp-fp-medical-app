import type { Request, Response, NextFunction } from "express";
import { symptomCatalogService } from "../services/symptom.service";

export const symptomCatalogController = {
  async list(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const symptoms = await symptomCatalogService.list(req.query.search as string | undefined);
      res.json({ data: symptoms });
    } catch (err) {
      next(err);
    }
  }
}