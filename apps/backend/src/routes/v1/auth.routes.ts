import { Router } from "express";
import {
  signupController,
  loginController,
  logoutController,
  refreshTokenController,
} from "../../controllers/v1/auth.controller";
import { validate } from "../../middlewares/validate";
import {
  userSignupSchema,
  userLoginSchema,
} from "@sports-booking-platform/validation";
import asyncHandler from "../../utils/asyncHandler";
import authenticate from "../../middlewares/authenticate";

const router = Router();

router.post(
  "/signup",
  validate(userSignupSchema),
  asyncHandler(signupController)
);

router.post("/login", validate(userLoginSchema), asyncHandler(loginController));

router.use(asyncHandler(authenticate));

router.post("/logout", asyncHandler(logoutController));

router.post("/refresh-token", asyncHandler(refreshTokenController));

export default router;
