import { Router } from "express";
import {
  ownerCreateProductController,
  ownerGetProductsController,
  ownerUpdateProductController,
  ownerUpdateProductStockController,
} from "../../controllers/v1/product.controller";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import { upload } from "../../middlewares/multer";
import { validate } from "../../middlewares/validate";
import asyncHandler from "../../utils/asyncHandler";
import {
  createProductSchema,
  ownerGetProductsQuerySchema,
  updateProductSchema,
  updateProductStockSchema,
} from "../../validations";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(["OWNER"]),
  validate(ownerGetProductsQuerySchema),
  asyncHandler(ownerGetProductsController),
);

router.post(
  "/",
  authenticate,
  authorize(["OWNER"]),
  upload.fields([{ name: "product_image", maxCount: 1 }]),
  validate(createProductSchema),
  asyncHandler(ownerCreateProductController),
);

router.patch(
  "/:id",
  authenticate,
  authorize(["OWNER"]),
  upload.fields([{ name: "product_image", maxCount: 1 }]),
  validate(updateProductSchema),
  asyncHandler(ownerUpdateProductController),
);

router.patch(
  "/:id/stock",
  authenticate,
  authorize(["OWNER"]),
  validate(updateProductStockSchema),
  asyncHandler(ownerUpdateProductStockController),
);

export default router;
