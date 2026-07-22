import { Router } from "express";
import { rateLimiter } from "../middleware/rate-limiter";
import { ConditionsController } from "../controllers/conditions.controller";
import { validate } from "../middleware/validate";
import {conditionIdParamSchema, createConditionSchema, listConditionsQuerySchema, searchConditionsOnlineQuerySchema} from "../schemas/conditions.schema";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);
// get all conditions
router.get("/",
    validate(listConditionsQuerySchema, "query"),
    ConditionsController.list,
);

// get conditions from external API
router.get("/search-online",
    rateLimiter,
    validate(searchConditionsOnlineQuerySchema, "query"),
    (req, res,next) => ConditionsController.getConditions(req, res,next)
);

// get condition by id
router.get(
  "/:id",
  validate(conditionIdParamSchema, "params"),
  ConditionsController.getById,
);

// post a new condition
router.post(
  "/",
  validate(createConditionSchema),
  ConditionsController.create,
);

export { router as conditionsRouter };