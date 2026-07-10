import { Request, Response } from "express";
import { conditionService } from "../services/conditions.service";
import axios from "axios";
import { NextFunction } from "express";

export class ConditionsController {
  
  async getConditions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search } = req.query as { search?: string };
      const conditions = await conditionService.searchConditions(search);
      res.status(200).json(conditions);
    } catch (error) {
      // external API failed 
      if (axios.isAxiosError(error)) {
        res.status(502).json({ error: "External conditions API unavailable" });
        return;
      }
      next(error);
    }
  }
}
export const conditionsController = new ConditionsController();