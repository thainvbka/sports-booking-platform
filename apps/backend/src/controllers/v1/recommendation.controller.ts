import { Request, Response } from "express";
import { getRecommendationsForPlayer } from "../../services/v1/recommendation.service";
import { SuccessResponse } from "../../utils/success.response";

export const getMyRecommendationsController = async (
  req: Request,
  res: Response,
) => {
  const result = await getRecommendationsForPlayer(
    req.user?.profiles?.playerId as string,
  );

  return new SuccessResponse({
    message: "Recommendations retrieved successfully",
    data: result,
  }).send(res);
};
