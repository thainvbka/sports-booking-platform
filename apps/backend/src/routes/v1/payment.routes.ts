import { Router } from "express";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import asyncHandler from "../../utils/asyncHandler";

import {
  checkStripeAccountStatusController,
  createCheckoutSessionController,
  createConnectAccountController,
  createVnpayCheckoutSessionController,
  handleVnpayIpnController,
  handleStripeCheckoutCancelController,
} from "../../controllers/v1/payment.controller";

const router = Router();

router.post(
  "/stripe/connect-account", // Tạo Stripe Connect Account
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(createConnectAccountController),
);

router.get(
  "/stripe/check-status", // Hoàn thành onboarding
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(checkStripeAccountStatusController),
);

router.post(
  "/checkout-session", // Tạo checkout session
  authenticate,
  authorize(["PLAYER"]),
  asyncHandler(createCheckoutSessionController),
);

router.post(
  "/vnpay/checkout-session", // Tạo checkout session VNPAY
  authenticate,
  authorize(["PLAYER"]),
  asyncHandler(createVnpayCheckoutSessionController),
);

router.get(
  "/vnpay/ipn", // Xử lý IPN từ VNPAY (Public endpoint)
  asyncHandler(handleVnpayIpnController),
);
router.post(
  "/stripe/cancel-checkout", // User bấm quay lại từ trang thanh toán Stripe
  authenticate,
  authorize(["PLAYER"]),
  asyncHandler(handleStripeCheckoutCancelController),
);

export default router;

