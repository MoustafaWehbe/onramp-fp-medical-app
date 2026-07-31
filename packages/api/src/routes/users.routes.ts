import { Router } from "express";
import { usersController } from "../controllers/users.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import {
  updateEmailSchema,
  updatePasswordSchema,
  deleteAccountSchema,
} from "../schemas/users.schemas";

const router = Router();

router.patch(
  "/me/email",
  authenticate,
  validate(updateEmailSchema),
  usersController.updateEmail,
);
router.patch(
  "/me/password",
  authenticate,
  validate(updatePasswordSchema),
  usersController.updatePassword,
);
router.delete(
  "/me",
  authenticate,
  validate(deleteAccountSchema),
  usersController.deleteMe,
);

export { router as usersRouter };
