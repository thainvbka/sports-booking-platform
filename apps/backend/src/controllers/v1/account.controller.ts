import { Request, Response } from "express";
import { addRoleToAccount } from "../../services/v1/account.service";
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
