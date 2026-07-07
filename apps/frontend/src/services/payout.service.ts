import { api } from "@/lib/axios";
import type {
  ApiResponse,
  PayoutStatus,
  OwnerPayoutRecord,
  PayoutBatchRecord,
  BankDetails,
  OwnerWalletResponse,
  AdminPayoutBatchRecord,
  AdminOwnerWalletRecord,
} from "@/types";

export const payoutService = {
  // --- OWNER WALLET & PAYOUT ACTIONS ---
  getOwnerWallet: async () => {
    const response = await api.get<ApiResponse<OwnerWalletResponse>>("/payouts/owner/wallet");
    return response.data;
  },

  updateBankDetails: async (data: {
    bank_name: string;
    bank_account_number: string;
    bank_account_name: string;
    bank_branch?: string;
  }) => {
    const response = await api.post<ApiResponse<BankDetails>>("/payouts/owner/bank-details", data);
    return response.data;
  },

  requestPayout: async () => {
    const response = await api.post<ApiResponse<PayoutBatchRecord>>("/payouts/owner/payout-request");
    return response.data;
  },

  // --- ADMIN SETTLEMENT ACTIONS ---
  adminGetPayoutBatches: async (status?: PayoutStatus) => {
    const response = await api.get<ApiResponse<AdminPayoutBatchRecord[]>>("/payouts/admin", {
      params: status ? { status } : {},
    });
    return response.data;
  },

  adminGetOwnerWallets: async () => {
    const response = await api.get<ApiResponse<AdminOwnerWalletRecord[]>>("/payouts/admin/wallets");
    return response.data;
  },

  adminProcessPayoutBatch: async (batchId: string) => {
    const response = await api.post<ApiResponse<PayoutBatchRecord>>(
      `/payouts/admin/${batchId}/process`
    );
    return response.data;
  },

  adminApprovePayoutBatch: async (
    batchId: string,
    data: {
      transaction_ref: string;
      note?: string;
    }
  ) => {
    const response = await api.post<ApiResponse<PayoutBatchRecord>>(
      `/payouts/admin/${batchId}/approve`,
      data
    );
    return response.data;
  },

  adminCancelPayoutBatch: async (batchId: string, note?: string) => {
    const response = await api.post<ApiResponse<PayoutBatchRecord>>(
      `/payouts/admin/${batchId}/cancel`,
      { note }
    );
    return response.data;
  },
};
