import { Router } from "express";
import { rateLimiter } from "../middleware/rate-limiter";
import { ConditionsController } from "../controllers/conditions.controller";
import { validate } from "../middleware/validate";
import {createConditionSchema, listConditionsQuerySchema, searchConditionsOnlineQuerySchema} from "../schemas/conditions.schema";

const router = Router();

// get all conditions
router.get("/",
    validate(listConditionsQuerySchema, "query"),
    ConditionsController.list,
);

// post a new condition
router.post(
  "/",
  validate(createConditionSchema),
  ConditionsController.create,
);
// get conditions from external API
router.get("/search-online",
    rateLimiter,
    validate(searchConditionsOnlineQuerySchema, "query"),
    (req, res,next) => ConditionsController.getConditions(req, res,next)
);

export { router as conditionsRouter };