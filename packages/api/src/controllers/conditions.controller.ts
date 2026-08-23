import { NextFunction, Request, Response } from "express";
import { conditionService } from "../services/conditions.service";
import { userConditionService } from "../services/user-condition.service";
import { conditionSymptomService } from "../services/condition-symptom.service";
import axios from "axios";

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
          language: req.language,
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
      if (axios.isAxiosError(error)) {
        res.status(502).json({ error: "External conditions API unavailable" });
        return;
      }
      next(error);
    }
  },

  async getById( req: Request, res: Response, next: NextFunction,): Promise<void> {
    try {
      const { id } = req.params as {
        id: string;
      };
      const condition =
        await conditionService.getById(id, req.language);
      res.json({
        data: condition,
      });
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

    const result = await userConditionService.list({
      userId: req.user!.userId,
      currentPage,
      pageSize,
      search,
      language: req.language,
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
    const userCondition =
      await userConditionService.getById(
        req.user!.userId,
        id,
        req.language,
      );
    res.json({ data: userCondition });
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
    const userCondition =
      await userConditionService.create({
        userId: req.user!.userId,
        language: req.language,
        ...req.body,
      });
    res.status(201).json({
      data: userCondition,
    });
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
    const { id } = req.params as {
      id: string;
    };
    const userCondition =
      await userConditionService.update({
        userId: req.user!.userId,
        id,
        language: req.language,
        ...req.body,
      });
    res.json({
      data: userCondition,
    });
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
    const { id } = req.params as {
      id: string;
    };
    const result =
      await userConditionService.remove(
        req.user!.userId,
        id,
      );
    res.json({
      data: result,
    });
  } catch (err) {
    next(err);
  }
},

async listAllProfileSymptoms(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { currentPage, pageSize } = req.query as unknown as {
      currentPage: number;
      pageSize: number;
    };
    const result = await conditionSymptomService.listAll({
      userId: req.user!.userId,
      currentPage,
      pageSize,
      language: req.language,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
},

async listProfileSymptoms(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { currentPage, pageSize } = req.query as unknown as {
      currentPage: number;
      pageSize: number;
    };
    const result = await conditionSymptomService.list({
      userId: req.user!.userId,
      userConditionId: id,
      currentPage,
      pageSize,
      language: req.language,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
},

async linkProfileSymptom(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { userSymptomId } = req.body as { userSymptomId: string };
    const link = await conditionSymptomService.link({
      userId: req.user!.userId,
      userConditionId: id,
      userSymptomId,
      language: req.language,
    });
    res.status(201).json({ data: link });
  } catch (err) {
    next(err);
  }
},

async unlinkProfileSymptom(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id, userSymptomId } = req.params as {
      id: string;
      userSymptomId: string;
    };
    const result = await conditionSymptomService.unlink(
      req.user!.userId,
      id,
      userSymptomId,
    );
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
},
}