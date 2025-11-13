import { Request, Response } from "express";
import { addRoleToAccount } from "../../services/v1/account.service";
import { SuccessResponse } from "../../utils/success.response";

export const addRoleController = async (req: Request, res: Response) => {
  // Lấy accountId từ middleware authenticate
  const accountId = req.accountId;
  const roleData = req.body;

  const result = await addRoleToAccount(accountId!, roleData);

  return new SuccessResponse({
    message: result.message,
  }).send(res);
};
