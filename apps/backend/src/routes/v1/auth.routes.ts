import { Router } from "express";
import { signupController } from "../../controllers/v1/auth.controller";
import { validate } from "../../middlewares/validate";
import { userSignupSchema } from "@sports-booking-platform/validation";
const router = Router();

router.post("/signup", validate(userSignupSchema), signupController);

export default router;
