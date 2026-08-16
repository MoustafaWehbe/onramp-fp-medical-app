import { Router } from "express";
import { analyticsController } from "../controllers/analytics.controller";
import { validate } from "../middleware/validate";
import { analyticsDashboardQuerySchema } from "../schemas/analytics.schema";
import { authenticate } from "src/middleware/authenticate";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  validate(
    analyticsDashboardQuerySchema,
    "query",
  ),
  analyticsController.dashboard,
);

export { router as analyticsRouter };