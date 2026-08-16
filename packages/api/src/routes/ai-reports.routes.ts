import { Router } from "express";
import { AiReportController } from "../controllers/ai-report.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import {
  aiReportIdParamSchema,
  generateAiReportSchema,
  listAiReportsQuerySchema,
} from "../schemas/ai-report.schemas";

const router = Router();

router.get(
  "/",
  authenticate,
  validate(listAiReportsQuerySchema, "query"),
  AiReportController.list,
);

router.post(
  "/generate",
  authenticate,
  validate(generateAiReportSchema),
  AiReportController.generate,
);

router.get(
  "/:id",
  authenticate,
  validate(aiReportIdParamSchema, "params"),
  AiReportController.getById,
);

router.delete(
  "/:id",
  authenticate,
  validate(aiReportIdParamSchema, "params"),
  AiReportController.remove,
);

export { router as aiReportsRouter };
