import { Request, Response } from "express";
import { SuccessResponse } from "../../utils/success.response";

import {
  createConnectAccount,
  checkStripeAccountStatus,
} from "../../services/v1/payment.service";

export const createConnectAccountController = async (
  req: Request,
  res: Response
) => {
  const ownerId = req.user?.profiles.ownerId as string;
  const result = await createConnectAccount(ownerId);
  return new SuccessResponse({
    message: "Stripe Connect account creation initiated",
    data: { ...result },
  }).send(res);
};

export const checkStripeAccountStatusController = async (
  req: Request,
  res: Response
) => {
  const ownerId = req.user?.profiles.ownerId as string;
  const result = await checkStripeAccountStatus(ownerId);
  return new SuccessResponse({
    message: "Payment setup completed successfully",
    data: { ...result },
  }).send(res);
};
