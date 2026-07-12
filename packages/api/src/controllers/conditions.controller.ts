import { Request, Response } from "express";
import { conditionService } from "../services/conditions.service";
import axios from "axios";
import { NextFunction } from "express";

export const ConditionsController = {

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { currentPage, pageSize, search } = req.query as unknown as {
          currentPage: number;
          pageSize: number;
          search?: string;
        };
        const result = await conditionService.list({
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
          const condition = await conditionService.create(req.body);
          res.status(201).json({ data: condition });
        } catch (err) {
          next(err);
        }
  },
  
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