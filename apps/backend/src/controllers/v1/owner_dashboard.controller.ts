import { Request, Response } from "express";
import { SuccessResponse } from "../../utils/success.response";

import { getOwnerDashboardStatsMetrics } from "../../services/v1/owner_dashboard.service";

export const getOwnerDashboardStatsMetricsController = async (
  req: Request,
  res: Response
) => {
  const ownerId = req.user?.profiles.ownerId as string;

  const statsMetrics = await getOwnerDashboardStatsMetrics(ownerId);

  return new SuccessResponse({
    message: "Owner dashboard stats metrics fetched successfully",
    data: statsMetrics,
  }).send(res);
};
