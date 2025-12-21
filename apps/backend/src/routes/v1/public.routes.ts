import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import {
  getPublicComplexActiveController,
  getPublicComplexByIdController,
  getAllPublicSubfieldsController,
} from "../../controllers/v1/public.controller";

const router = Router();

router.get("/complexes", asyncHandler(getPublicComplexActiveController));
router.get("/complexes/:id", asyncHandler(getPublicComplexByIdController));
router.get("/subfields", asyncHandler(getAllPublicSubfieldsController));

export default router;
