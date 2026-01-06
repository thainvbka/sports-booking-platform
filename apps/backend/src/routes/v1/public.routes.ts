import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import {
  getPublicComplexActiveController,
  getPublicComplexByIdController,
  getAllPublicSubfieldsController,
  getPublicSubfieldByIdController,
  getSubfieldAvailabilityController,
} from "../../controllers/v1/public.controller";

const router = Router();

router.get("/complexes", asyncHandler(getPublicComplexActiveController));
router.get("/complexes/:id", asyncHandler(getPublicComplexByIdController));
router.get("/subfields", asyncHandler(getAllPublicSubfieldsController));
router.get("/subfields/:id", asyncHandler(getPublicSubfieldByIdController));
router.get(
  "/subfields/:id/availability",
  asyncHandler(getSubfieldAvailabilityController)
);

export default router;
