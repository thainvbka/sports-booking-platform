import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import authenticate from "../../middlewares/authenticate";
import { addRoleController } from "../../controllers/v1/account.controller";
import { validate } from "../../middlewares/validate";
import { accountSchema } from "@sports-booking-platform/validation"; // Sẽ tạo schema này

const router = Router();

// Endpoint để thêm một vai trò mới vào tài khoản hiện tại
router.post(
  "/roles",
  authenticate,
  validate(accountSchema),
  asyncHandler(addRoleController)
);

export default router;
