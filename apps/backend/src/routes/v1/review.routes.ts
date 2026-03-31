import { Router } from "express";
import {
  createReviewController,
  deleteReviewController,
  ownerDeleteReviewController,
  updateReviewController,
} from "../../controllers/v1/review.controller";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import asyncHandler from "../../utils/asyncHandler";
import { createReviewSchema, updateReviewSchema } from "../../validations";

import { upload } from "../../middlewares/multer";

const router = Router();

// PLAYER routes
router.post(
  "/",
  authenticate,
  authorize(["PLAYER"]),
  upload.fields([{ name: "images", maxCount: 5 }]),
  validate(createReviewSchema),
  asyncHandler(createReviewController),
);

router.patch(
  "/:id",
  authenticate,
  authorize(["PLAYER"]),
  upload.fields([{ name: "images", maxCount: 5 }]),
  validate(updateReviewSchema),
  asyncHandler(updateReviewController),
);

router.delete(
  "/:id",
  authenticate,
  authorize(["PLAYER"]),
  asyncHandler(deleteReviewController),
);

// OWNER routes
router.delete(
  "/owner/:id",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(ownerDeleteReviewController),
);

export default router;
