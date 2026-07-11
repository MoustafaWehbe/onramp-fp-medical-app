import type { Request, Response, NextFunction } from "express";
import { symptomCatalogService, symptomServiceapi } from "../services/symptom.service";


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
  },
  async search(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { term } = req.query as { term: string };
      const symptoms = await symptomServiceapi.searchSymptomsFromApi(term);
      res.json({ data: symptoms });
    } catch (err) {
      next(err);
    }
  }
}