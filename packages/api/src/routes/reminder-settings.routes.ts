import { Router } from "express";

import { reminderSettingsController } from "../controllers/reminder-settings.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { updateReminderSettingsSchema } from "../schemas/reminder-settings.schemas";

const router = Router();

router.get(
  "/me",
  authenticate,
  reminderSettingsController.getSettings,
);

router.patch(
  "/me",
  authenticate,
  validate(updateReminderSettingsSchema),
  reminderSettingsController.updateSettings,
);

export { router as reminderSettingsRouter };
