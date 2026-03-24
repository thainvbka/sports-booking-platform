import { Router } from "express";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import asyncHandler from "../../utils/asyncHandler";

import {
  createPricingRuleSchema,
  updatePricingRuleSchema,
} from "../../validations";

import {
  bulkDeletePricingRulesController,
  copyPricingRulesController,
  createPricingRuleController,
  deletePricingRuleController,
  getOwnerPricingRulesByDayController,
  updatePricingRuleController,
} from "../../controllers/v1/pricing_rule.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(["OWNER"]),
  validate(createPricingRuleSchema),
  asyncHandler(createPricingRuleController),
);
router.get(
  "/",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(getOwnerPricingRulesByDayController),
);
router.patch(
  "/:id",
  authenticate,
  authorize(["OWNER"]),
  validate(updatePricingRuleSchema),
  asyncHandler(updatePricingRuleController),
);
router.delete(
  "/:id",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(deletePricingRuleController),
);

router.post(
  "/bulk-delete",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(bulkDeletePricingRulesController),
);

router.post(
  "/copy",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(copyPricingRulesController),
);

export default router;
