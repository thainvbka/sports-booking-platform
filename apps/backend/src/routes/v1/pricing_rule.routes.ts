import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";

import {
  createPricingRuleSchema,
  updatePricingRuleSchema,
} from "@sports-booking-platform/validation";

import {
  createPricingRuleController,
  getOwnerPricingRulesByDayController,
  updatePricingRuleController,
  deletePricingRuleController,
} from "../../controllers/v1/pricing_rule.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(["OWNER"]),
  validate(createPricingRuleSchema),
  asyncHandler(createPricingRuleController)
);
router.get(
  "/",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(getOwnerPricingRulesByDayController)
);
router.patch(
  "/:id",
  authenticate,
  authorize(["OWNER"]),
  validate(updatePricingRuleSchema),
  asyncHandler(updatePricingRuleController)
);
router.delete(
  "/:id",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(deletePricingRuleController)
);

export default router;
