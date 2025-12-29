import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";

import {
  createConnectAccountController,
  checkStripeAccountStatusController,
  createCheckoutSessionController,
} from "../../controllers/v1/payment.controller";

const router = Router();

router.post(
  "/stripe/connect-account", // Tạo Stripe Connect Account
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(createConnectAccountController)
);

router.get(
  "/stripe/check-status", // Hoàn thành onboarding
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(checkStripeAccountStatusController)
);

router.post(
  "/checkout-session", // Tạo checkout session
  authenticate,
  authorize(["PLAYER"]),
  asyncHandler(createCheckoutSessionController)
);

export default router;
