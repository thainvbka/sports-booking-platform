import { Router } from "express";
import {
    getPublicMatchByIdController,
    getPublicMatchesController,
} from "../../controllers/v1/match.controller";
import {
    getAllPublicSubfieldsController,
    getPublicComplexActiveController,
    getPublicComplexByIdController,
    getPublicSubfieldByIdController,
    getSubfieldAvailabilityController,
} from "../../controllers/v1/public.controller";
import { getSubfieldReviewsController } from "../../controllers/v1/review.controller";
import { validate } from "../../middlewares/validate";
import asyncHandler from "../../utils/asyncHandler";
import {
    getPublicMatchesQuerySchema,
    matchIdParamSchema,
} from "../../validations";

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
router.get(
  "/matches",
  validate(getPublicMatchesQuerySchema),
  asyncHandler(getPublicMatchesController),
);
router.get(
  "/matches/:id",
  validate(matchIdParamSchema),
  asyncHandler(getPublicMatchByIdController),
);

export default router;
