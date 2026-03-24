import { Router } from "express";
import {
  createComplexController,
  deleteComplexController,
  getOwnerComplexByIdController,
  getOwnerComplexesController,
  reactivateComplexController,
  updateComplexController,
} from "../../controllers/v1/complex.controller";
import { createSubfieldController } from "../../controllers/v1/subfield.controller";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import { upload } from "../../middlewares/multer";
import { validate } from "../../middlewares/validate";
import asyncHandler from "../../utils/asyncHandler";
import { createComplexSchema, updateComplexSchema } from "../../validations";

import { createSubfieldSchema } from "../../validations";

const router = Router();

/**
 * OWNER Routes
 */
router.post(
  "/",
  authenticate,
  authorize(["OWNER"]),
  upload.fields([
    { name: "complex_image", maxCount: 1 },
    { name: "verification_docs", maxCount: 10 },
  ]),
  validate(createComplexSchema),
  asyncHandler(createComplexController),
);

router.patch(
  "/:id",
  authenticate,
  authorize(["OWNER"]),
  validate(updateComplexSchema),
  asyncHandler(updateComplexController),
);

router.post(
  "/:id/sub-fields",
  authenticate,
  authorize(["OWNER"]),
  upload.fields([{ name: "subfield_image", maxCount: 1 }]),
  validate(createSubfieldSchema),
  asyncHandler(createSubfieldController),
);

router.get(
  "/",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(getOwnerComplexesController),
);

router.get(
  "/:id",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(getOwnerComplexByIdController),
);

router.delete(
  "/:id",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(deleteComplexController),
);

router.post(
  "/:id/reactivate",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(reactivateComplexController),
);

export default router;
