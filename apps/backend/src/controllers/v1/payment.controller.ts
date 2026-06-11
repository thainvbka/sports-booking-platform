import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../utils/error.response";
import { SuccessResponse } from "../../utils/success.response";

import {
  checkStripeAccountStatus,
  createCheckoutSession,
  createConnectAccount,
  handleStripeWebhook,
  createVnpayCheckoutSession,
  handleVnpayIpn,
  handleStripeCheckoutCancel,
} from "../../services/v1/payment.service";

export const createConnectAccountController = async (
  req: Request,
  res: Response,
) => {
  const ownerId = req.user?.profiles.ownerId as string;
  if (!ownerId) {
    throw new BadRequestError(
      "Owner profile not found. Please ensure you have an owner role.",
    );
  }
  const result = await createConnectAccount(ownerId);
  return new SuccessResponse({
    message: "Stripe Connect account creation initiated",
    data: { ...result },
  }).send(res);
};

export const checkStripeAccountStatusController = async (
  req: Request,
  res: Response,
) => {
  const ownerId = req.user?.profiles.ownerId as string;
  if (!ownerId) {
    throw new BadRequestError(
      "Owner profile not found. Please ensure you have an owner role.",
    );
  }
  const result = await checkStripeAccountStatus(ownerId);
  return new SuccessResponse({
    message: "Payment setup completed successfully",
    data: { ...result },
  }).send(res);
};

export const createCheckoutSessionController = async (
  req: Request,
  res: Response,
) => {
  const playerId = req.user?.profiles.playerId as string;
  const bookingIds: string[] = req.body.booking_ids;
  const result = await createCheckoutSession(playerId, bookingIds);
  return new SuccessResponse({
    message: "Checkout session created successfully",
    data: { ...result },
  }).send(res);
};

export const handleStripeWebhookController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sig = req.headers["stripe-signature"] as string;
    const rawBody = req.body;

    await handleStripeWebhook(sig, rawBody);
    return new SuccessResponse({
      message: "Webhook handled successfully",
    }).send(res);
  } catch (error) {
    return next(error);
  }
};

export const createVnpayCheckoutSessionController = async (
  req: Request,
  res: Response,
) => {
  const playerId = req.user?.profiles.playerId as string;
  const bookingIds: string[] = req.body.booking_ids;
  
  // Lấy IP của client
  let ipAddress = 
    (req.headers["x-forwarded-for"] as string) || 
    req.socket.remoteAddress || 
    "127.0.0.1";
    
  if (ipAddress.includes(",")) {
    ipAddress = ipAddress.split(",")[0].trim();
  }

  const result = await createVnpayCheckoutSession(playerId, bookingIds, ipAddress);
  return new SuccessResponse({
    message: "VNPay checkout session created successfully",
    data: { ...result },
  }).send(res);
};

export const handleVnpayIpnController = async (
  req: Request,
  res: Response,
) => {
  const result = await handleVnpayIpn(req.query);
  // VNPay yêu cầu phản hồi dạng JSON với status 200 luôn
  return res.status(200).json(result);
};

export const handleStripeCheckoutCancelController = async (
  req: Request,
  res: Response,
) => {
  const playerId = req.user?.profiles.playerId as string;
  const bookingIds: string[] = req.body.booking_ids;
  await handleStripeCheckoutCancel(playerId, bookingIds);
  return new SuccessResponse({
    message: "Checkout cancelled, booking timeout has been reset",
  }).send(res);
};

