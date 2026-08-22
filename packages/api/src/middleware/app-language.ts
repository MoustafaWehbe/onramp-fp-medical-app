import type { Request, Response, NextFunction } from "express";
import {
  parseAppLanguage,
  type AppLanguage,
} from "../lib/app-language";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      language: AppLanguage;
    }
  }
}

const HEADER = "x-app-language";

export function appLanguage(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  req.language = parseAppLanguage(req.header(HEADER));
  next();
}
