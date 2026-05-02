import { Router } from "express";
import {
  getNotificationsController,
  getUnreadNotificationCountController,
  markAllNotificationsAsReadController,
  markNotificationAsReadController,
} from "../../controllers/v1/notification.controller";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import asyncHandler from "../../utils/asyncHandler";
import {
  notificationIdParamSchema,
  notificationListQuerySchema,
  notificationRoleFilterQuerySchema,
} from "../../validations";

const router = Router();
router.use(authenticate);
router.use(authorize(["PLAYER", "OWNER", "ADMIN"]));

router.get(
  "/",
  validate(notificationListQuerySchema),
  asyncHandler(getNotificationsController),
);

router.get(
  "/unread-count",
  validate(notificationRoleFilterQuerySchema),
  asyncHandler(getUnreadNotificationCountController),
);

router.patch(
  "/:id/read",
  validate(notificationIdParamSchema),
  asyncHandler(markNotificationAsReadController),
);

router.patch(
  "/read-all",
  validate(notificationRoleFilterQuerySchema),
  asyncHandler(markAllNotificationsAsReadController),
);

export default router;

