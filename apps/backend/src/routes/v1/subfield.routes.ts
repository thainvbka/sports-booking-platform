import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { upload } from "../../middlewares/multer";

import {
  getOwnerSubfieldByIdController,
  updateSubfieldController,
  deleteSubfieldController,
} from "../../controllers/v1/subfield.controller";
import { updateSubfieldSchema } from "@sports-booking-platform/validation/subfield.schema";

const router = Router();

router.get(
  "/:id",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(getOwnerSubfieldByIdController)
);

router.patch(
  "/:id",
  authenticate,
  authorize(["OWNER"]),
  validate(updateSubfieldSchema),
  asyncHandler(updateSubfieldController)
);

router.delete(
  "/:id",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(deleteSubfieldController)
);

export default router;
