import { Router } from "express";
import * as adminController from "../../controllers/v1/admin.controller";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import asyncHandler from "../../utils/asyncHandler";
import {
  adminQuerySchema,
  updateComplexStatusSchema,
  updateUserStatusSchema,
} from "../../validations/admin.schema";

const router = Router();

// All admin routes are protected
router.use(authenticate);
router.use(authorize(["ADMIN"]));

// Dashboard
router.get("/stats", asyncHandler(adminController.getStats));
router.get("/analytics", asyncHandler(adminController.getAnalytics));

// User Management
router.get(
  "/users",
  validate(adminQuerySchema),
  asyncHandler(adminController.getUsers),
);
router.patch(
  "/users/:id/status",
  validate(updateUserStatusSchema),
  asyncHandler(adminController.updateUserStatus),
);

// Complex Management
router.get(
  "/complexes",
  validate(adminQuerySchema),
  asyncHandler(adminController.getComplexes),
);
router.patch(
  "/complexes/:id/status",
  validate(updateComplexStatusSchema),
  asyncHandler(adminController.updateComplexStatus),
);

// Monitoring
router.get(
  "/bookings",
  validate(adminQuerySchema),
  asyncHandler(adminController.getBookings),
);
router.get(
  "/payments",
  validate(adminQuerySchema),
  asyncHandler(adminController.getPayments),
);

export default router;
