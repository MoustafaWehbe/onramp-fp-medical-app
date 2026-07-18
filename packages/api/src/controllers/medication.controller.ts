import type { Request, Response, NextFunction } from "express";
import { medicationService } from "../services/medication.service";
import { userMedicationService } from "../services/user-medication.service";

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

  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params as {
        id: string;
      };

      const medication =
        await medicationService.getById(id);

      res.json({
        data: medication,
      });
    } catch (err) {
      next(err);
    }
  },

  // profile medication controller methods
  async listProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { currentPage, pageSize, search } =
      req.query as unknown as {
        currentPage: number;
        pageSize: number;
        search?: string;
      };

    const result = await userMedicationService.list({
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
    const { id } = req.params as {
      id: string;
    };

    const userMedication =
      await userMedicationService.getById(
        req.user!.userId,
        id,
      );

    res.json({
      data: userMedication,
    });
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
    const userMedication =
      await userMedicationService.create({
        userId: req.user!.userId,
        ...req.body,
      });

    res.status(201).json({
      data: userMedication,
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

    const userMedication =
      await userMedicationService.update({
        userId: req.user!.userId,
        id,
        ...req.body,
      });

    res.json({
      data: userMedication,
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
      await userMedicationService.remove(
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
};
