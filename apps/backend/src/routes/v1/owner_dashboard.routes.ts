import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import { getOwnerDashboardStatsMetricsController } from "../../controllers/v1/owner_dashboard.controller";

const router = Router();

/**
 * OWNER Routes
 */
router.get(
  "/stats-metrics",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(getOwnerDashboardStatsMetricsController)
);

export default router;
