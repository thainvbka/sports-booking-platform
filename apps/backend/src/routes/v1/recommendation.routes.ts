import { Router } from "express";
import { getMyRecommendationsController } from "../../controllers/v1/recommendation.controller";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import asyncHandler from "../../utils/asyncHandler";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(["PLAYER"]),
  asyncHandler(getMyRecommendationsController),
);

export default router;
