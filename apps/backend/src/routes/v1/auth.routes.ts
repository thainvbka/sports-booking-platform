import { Router } from "express";
import {
  signupController,
  loginController,
  logoutController,
  refreshTokenController,
} from "../../controllers/v1/auth.controller";
import { validate } from "../../middlewares/validate";
import asyncHandler from "../../utils/asyncHandler";
import authenticate from "../../middlewares/authenticate";
import {
  registerSchema,
  loginSchema,
} from "@sports-booking-platform/validation/access.schema";

const router = Router();

router.post(
  "/signup",
  validate(registerSchema),
  asyncHandler(signupController)
);

router.post("/login", validate(loginSchema), asyncHandler(loginController));

router.use(asyncHandler(authenticate));

router.post("/logout", asyncHandler(logoutController));

router.post("/refresh-token", asyncHandler(refreshTokenController));

export default router;
