import { Router } from "express";
import {
  getAllPublicSubfieldsController,
  getPublicComplexActiveController,
  getPublicComplexByIdController,
  getPublicSubfieldByIdController,
  getSubfieldAvailabilityController,
} from "../../controllers/v1/public.controller";
import { getSubfieldReviewsController } from "../../controllers/v1/review.controller";
import asyncHandler from "../../utils/asyncHandler";

const router = Router();

router.get("/complexes", asyncHandler(getPublicComplexActiveController));
router.get("/complexes/:id", asyncHandler(getPublicComplexByIdController));
router.get("/subfields", asyncHandler(getAllPublicSubfieldsController));
router.get("/subfields/:id", asyncHandler(getPublicSubfieldByIdController));
router.get(
  "/subfields/:id/availability",
  asyncHandler(getSubfieldAvailabilityController),
);
router.get(
  "/subfields/:id/reviews",
  asyncHandler(getSubfieldReviewsController),
);

export default router;
