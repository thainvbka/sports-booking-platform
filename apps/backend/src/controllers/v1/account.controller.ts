import { Request, Response } from "express";
import {
  addRoleToAccount,
  updateProfile,
} from "../../services/v1/account.service";
import { SuccessResponse } from "../../utils/success.response";
import { setRefreshTokenCookie } from "../../utils/cookie";

export const addRoleController = async (req: Request, res: Response) => {
  // Lấy accountId từ middleware authenticate
  const accountId = req.user?.accountId;
  const roleData = req.body;

  const result = await addRoleToAccount(accountId!, roleData);

  // Set refresh token in cookie like auth endpoints
  setRefreshTokenCookie(res, result.refreshToken);

  return new SuccessResponse({
    message: result.message,
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  }).send(res);
};

export const updateProfileController = async (req: Request, res: Response) => {
  const accountId = req.user?.accountId;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const result = await updateProfile(accountId!, req.body, files);

  return new SuccessResponse({
    message: "Cập nhật hồ sơ thành công",
    data: result,
  }).send(res);
};
