import { Router } from "express";
import {
  signupController,
  loginController,
} from "../../controllers/v1/auth.controller";
import { validate } from "../../middlewares/validate";
import {
  userSignupSchema,
  userLoginSchema,
} from "@sports-booking-platform/validation";
const router = Router();
import asyncHandler from "../../utils/asyncHandler";

router.post(
  "/signup",
  validate(userSignupSchema),
  asyncHandler(signupController)
);

router.post("/login", validate(userLoginSchema), asyncHandler(loginController));
export default router;
