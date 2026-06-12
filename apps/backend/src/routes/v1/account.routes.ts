import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import authenticate from "../../middlewares/authenticate";
import {
  addRoleController,
  updateProfileController,
} from "../../controllers/v1/account.controller";
import { validate } from "../../middlewares/validate";
import { accountSchema } from "../../validations"; // Sẽ tạo schema này
import { upload } from "../../middlewares/multer";

const router = Router();

// Endpoint để thêm một vai trò mới vào tài khoản hiện tại
router.post(
  "/roles",
  authenticate,
  validate(accountSchema),
  asyncHandler(addRoleController),
);

// Endpoint để cập nhật hồ sơ cá nhân (full_name, phone_number, avatar, company_name)
router.put(
  "/profile",
  authenticate,
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  asyncHandler(updateProfileController),
);

export default router;
