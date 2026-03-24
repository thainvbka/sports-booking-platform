import { Router } from "express";
import { getOwnerDashboardStatsMetricsController } from "../../controllers/v1/owner_dashboard.controller";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import asyncHandler from "../../utils/asyncHandler";

const router = Router();

/**
 * OWNER Routes
 */
router.get(
  "/stats-metrics",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(getOwnerDashboardStatsMetricsController),
);

export default router;
