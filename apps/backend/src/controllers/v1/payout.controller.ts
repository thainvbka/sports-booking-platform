import { Request, Response } from "express";
import { BadRequestError } from "../../utils/error.response";
import { SuccessResponse } from "../../utils/success.response";
import { PayoutStatus } from "@prisma/client";
import {
  getOwnerWallet,
  updateOwnerBankDetails,
  requestOwnerPayout,
  adminGetPayoutBatches,
  adminProcessPayoutBatch,
  adminApprovePayoutBatch,
  adminCancelPayoutBatch,
  adminGetOwnerWallets,
} from "../../services/v1/payout.service";

/**
 * Owner lấy thông tin ví, số dư và lịch sử giao dịch
 */
export const getOwnerWalletController = async (req: Request, res: Response) => {
  const ownerId = req.user?.profiles.ownerId as string;
  if (!ownerId) {
    throw new BadRequestError("Owner profile not found.");
  }

  const result = await getOwnerWallet(ownerId);
  return new SuccessResponse({
    message: "Owner wallet fetched successfully",
    data: result,
  }).send(res);
};

/**
 * Owner cập nhật thông tin tài khoản ngân hàng nội địa
 */
export const updateOwnerBankDetailsController = async (req: Request, res: Response) => {
  const ownerId = req.user?.profiles.ownerId as string;
  if (!ownerId) {
    throw new BadRequestError("Owner profile not found.");
  }

  const { bank_name, bank_account_number, bank_account_name, bank_branch } = req.body;
  if (!bank_name || !bank_account_number || !bank_account_name) {
    throw new BadRequestError("Missing required bank fields (bank_name, bank_account_number, bank_account_name).");
  }

  const result = await updateOwnerBankDetails(ownerId, {
    bank_name,
    bank_account_number,
    bank_account_name,
    bank_branch,
  });

  return new SuccessResponse({
    message: "Owner bank details updated successfully",
    data: result,
  }).send(res);
};

/**
 * Owner gửi yêu cầu rút tiền
 */
export const requestOwnerPayoutController = async (req: Request, res: Response) => {
  const ownerId = req.user?.profiles.ownerId as string;
  if (!ownerId) {
    throw new BadRequestError("Owner profile not found.");
  }

  const result = await requestOwnerPayout(ownerId);
  return new SuccessResponse({
    message: "Payout request submitted successfully",
    data: result,
  }).send(res);
};

/**
 * Admin lấy danh sách các đợt Payout
 */
export const adminGetPayoutBatchesController = async (req: Request, res: Response) => {
  const status = req.query.status as PayoutStatus | undefined;
  const result = await adminGetPayoutBatches(status);

  return new SuccessResponse({
    message: "Payout batches fetched successfully",
    data: result,
  }).send(res);
};

/**
 * Admin bắt đầu xử lý yêu cầu Payout (Chuyển trạng thái sang PROCESSING)
 */
export const adminProcessPayoutBatchController = async (req: Request, res: Response) => {
  const { batchId } = req.params;
  if (!batchId) {
    throw new BadRequestError("Missing batchId parameter.");
  }

  const result = await adminProcessPayoutBatch(batchId as string);
  return new SuccessResponse({
    message: "Payout batch is now in processing status",
    data: result,
  }).send(res);
};

/**
 * Admin phê duyệt Payout
 */
export const adminApprovePayoutBatchController = async (req: Request, res: Response) => {
  const { batchId } = req.params;
  const { transaction_ref, note } = req.body;

  if (!batchId) {
    throw new BadRequestError("Missing batchId parameter.");
  }
  if (!transaction_ref) {
    throw new BadRequestError("Transaction reference (transaction_ref) is required to approve payout.");
  }

  const result = await adminApprovePayoutBatch(batchId as string, {
    transaction_ref,
    note,
  });

  return new SuccessResponse({
    message: "Payout batch approved successfully",
    data: result,
  }).send(res);
};

/**
 * Admin từ chối/hủy yêu cầu Payout
 */
export const adminCancelPayoutBatchController = async (req: Request, res: Response) => {
  const { batchId } = req.params;
  const { note } = req.body;

  if (!batchId) {
    throw new BadRequestError("Missing batchId parameter.");
  }

  const result = await adminCancelPayoutBatch(batchId as string, note);
  return new SuccessResponse({
    message: "Payout batch cancelled and payouts reverted to pending",
    data: result,
  }).send(res);
};

/**
 * Admin lấy danh sách ví và số dư của tất cả Owner trong hệ thống
 */
export const adminGetOwnerWalletsController = async (_req: Request, res: Response) => {
  const result = await adminGetOwnerWallets();

  return new SuccessResponse({
    message: "Admin fetched owner wallets successfully",
    data: result,
  }).send(res);
};

