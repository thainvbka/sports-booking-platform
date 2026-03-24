import { Router } from "express";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import asyncHandler from "../../utils/asyncHandler";

import {
  deleteSubfieldController,
  getOwnerSubfieldByIdController,
  updateSubfieldController,
} from "../../controllers/v1/subfield.controller";
import { updateSubfieldSchema } from "../../validations";

const router = Router();

router.get(
  "/:id",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(getOwnerSubfieldByIdController),
);

router.patch(
  "/:id",
  authenticate,
  authorize(["OWNER"]),
  validate(updateSubfieldSchema),
  asyncHandler(updateSubfieldController),
);

router.delete(
  "/:id",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(deleteSubfieldController),
);

export default router;
