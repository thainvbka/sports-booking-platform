import { Router } from "express";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import asyncHandler from "../../utils/asyncHandler";
import {
  getOwnerWalletController,
  updateOwnerBankDetailsController,
  requestOwnerPayoutController,
  adminGetPayoutBatchesController,
  adminProcessPayoutBatchController,
  adminApprovePayoutBatchController,
  adminCancelPayoutBatchController,
  adminGetOwnerWalletsController,
} from "../../controllers/v1/payout.controller";

const router = Router();

// --- OWNER ROUTES ---
router.get(
  "/owner/wallet",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(getOwnerWalletController),
);

router.post(
  "/owner/bank-details",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(updateOwnerBankDetailsController),
);

router.post(
  "/owner/payout-request",
  authenticate,
  authorize(["OWNER"]),
  asyncHandler(requestOwnerPayoutController),
);

// --- ADMIN ROUTES ---
router.get(
  "/admin",
  authenticate,
  authorize(["ADMIN"]),
  asyncHandler(adminGetPayoutBatchesController),
);

router.get(
  "/admin/wallets",
  authenticate,
  authorize(["ADMIN"]),
  asyncHandler(adminGetOwnerWalletsController),
);

router.post(
  "/admin/:batchId/process",
  authenticate,
  authorize(["ADMIN"]),
  asyncHandler(adminProcessPayoutBatchController),
);

router.post(
  "/admin/:batchId/approve",
  authenticate,
  authorize(["ADMIN"]),
  asyncHandler(adminApprovePayoutBatchController),
);

router.post(
  "/admin/:batchId/cancel",
  authenticate,
  authorize(["ADMIN"]),
  asyncHandler(adminCancelPayoutBatchController),
);

export default router;
