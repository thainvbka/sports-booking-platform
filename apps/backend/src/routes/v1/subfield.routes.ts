import { Router } from "express";
import { getProductsBySubfieldController } from "../../controllers/v1/product.controller";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import asyncHandler from "../../utils/asyncHandler";

import {
  deleteSubfieldController,
  getOwnerSubfieldByIdController,
  updateSubfieldController,
} from "../../controllers/v1/subfield.controller";
import {
  getSubfieldProductsSchema,
  updateSubfieldSchema,
} from "../../validations";

const router = Router();

router.get(
  "/:id/products",
  validate(getSubfieldProductsSchema),
  asyncHandler(getProductsBySubfieldController),
);

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
