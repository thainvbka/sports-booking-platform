import { Router } from "express";
import {
  signupController,
  verifyEmailController,
  loginController,
  logoutController,
  refreshTokenController,
  forgotPasswordController,
  resetPasswordController,
  getCurrentUserController,
} from "../../controllers/v1/auth.controller";
import { validate } from "../../middlewares/validate";
import asyncHandler from "../../utils/asyncHandler";
import authenticate from "../../middlewares/authenticate";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@sports-booking-platform/validation";

const router = Router();

router.post(
  "/signup",
  validate(registerSchema),
  asyncHandler(signupController)
);

router.post(
  "/verify-email/:token",
  validate(verifyEmailSchema),
  asyncHandler(verifyEmailController)
);

router.post("/login", validate(loginSchema), asyncHandler(loginController));

router.post("/refresh-token", asyncHandler(refreshTokenController));

router.post("/logout", authenticate, asyncHandler(logoutController));

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  asyncHandler(forgotPasswordController)
);

router.put(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  asyncHandler(resetPasswordController)
);

router.get("/me", authenticate, asyncHandler(getCurrentUserController));

export default router;
