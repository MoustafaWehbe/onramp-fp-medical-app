import { Router } from "express";
import { rateLimiter } from "../middleware/rate-limiter";
import { conditionsController } from "../controllers/conditions.controller";
import { validate } from "../middleware/validate";
import { conditionQuerySchema } from "../schemas/catalog/conditions.schema";

const router = Router();

// get conditions from external API
router.get("/catalog",
    rateLimiter,
    validate(conditionQuerySchema, "query"),
    (req, res,next) => conditionsController.getConditions(req, res,next)
);

export { router as conditionsRouter };