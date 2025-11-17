import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { upload } from "../../middlewares/multer";
import {
  createComplexSchema,
  updateComplexSchema,
} from "@sports-booking-platform/validation/complex.schema";
import {
  createComplexController,
  getOwnerComplexesController,
  getOwnerComplexByIdController,
  updateComplexController,
  deleteComplexController,
  getPendingComplexesController,
  approveComplexController,
  rejectComplexController,
  suspendComplexController,
  getAllComplexesAdminController,
} from "../../controllers/v1/complex.controller";

const router = Router();

/**
 * OWNER Routes
 */
// Tạo Complex (upload ảnh đại diện + ảnh giấy tờ)
router.post(
  "/",
  authenticate,
  authorize(["OWNER"]),
  upload.fields([
    { name: "complex_image", maxCount: 1 },
    { name: "verification_docs", maxCount: 10 },
  ]),
  validate(createComplexSchema),
  asyncHandler(createComplexController)
);

router.get(
  "/",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(getOwnerComplexesController)
);

router.get(
  "/:id",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(getOwnerComplexByIdController)
);

router.patch(
  "/:id",
  authenticate,
  authorize(["OWNER"]),
  validate(updateComplexSchema),
  asyncHandler(updateComplexController)
);

router.delete(
  "/:id",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(deleteComplexController)
);

/**
 * ADMIN Routes
 */
router.get(
  "/pending",
  authenticate,
  authorize(["ADMIN"]),
  asyncHandler(getPendingComplexesController)
);

router.post(
  "/:id/approve",
  authenticate,
  authorize(["ADMIN"]),
  asyncHandler(approveComplexController)
);

router.post(
  "/:id/reject",
  authenticate,
  authorize(["ADMIN"]),
  asyncHandler(rejectComplexController)
);

router.post(
  "/:id/suspend",
  authenticate,
  authorize(["ADMIN"]),
  asyncHandler(suspendComplexController)
);

router.get(
  "/all",
  authenticate,
  authorize(["ADMIN"]),
  asyncHandler(getAllComplexesAdminController)
);

export default router;
