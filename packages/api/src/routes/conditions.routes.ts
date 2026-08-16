import { Router } from "express";
import { ConditionsController } from "../controllers/conditions.controller";
import { validate } from "../middleware/validate";
import {conditionIdParamSchema, createConditionSchema, listConditionsQuerySchema, searchConditionsOnlineQuerySchema} from "../schemas/conditions.schema";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(authenticate, authorize("admin", "user"));

router.get("/",
    validate(listConditionsQuerySchema, "query"),
    ConditionsController.list,
);

router.get("/search-online",
    validate(searchConditionsOnlineQuerySchema, "query"),
    (req, res,next) => ConditionsController.getConditions(req, res,next)
);

router.get(
  "/:id",
  validate(conditionIdParamSchema, "params"),
  ConditionsController.getById,
);

router.post(
  "/",
  validate(createConditionSchema),
  ConditionsController.create,
);

export { router as conditionsRouter };