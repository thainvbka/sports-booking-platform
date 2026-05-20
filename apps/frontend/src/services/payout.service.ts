import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types";

export type PayoutStatus = "PENDING" | "REQUESTED" | "PROCESSING" | "PAID" | "CANCELLED";

export interface OwnerPayoutRecord {
  id: string;
  total_amount: string | number;
  platform_fee: string | number;
  payout_amount: string | number;
  created_at: string;
}

export interface PayoutBatchRecord {
  id: string;
  total_payout: string | number;
  status: PayoutStatus;
  payout_period: string;
  transaction_ref: string | null;
  receipt_image: string | null;
  note: string | null;
  created_at: string;
  paid_at: string | null;
  payouts?: OwnerPayoutRecord[];
}

export interface BankDetails {
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  bank_branch: string | null;
}

export interface OwnerWalletResponse {
  bankDetails: BankDetails;
  balances: {
    pending: number;
    requested: number;
    paid: number;
  };
  batches: PayoutBatchRecord[];
}

export interface AdminPayoutBatchRecord extends PayoutBatchRecord {
  owner: {
    id: string;
    company_name: string;
    bank_name: string | null;
    bank_account_number: string | null;
    bank_account_name: string | null;
    bank_branch: string | null;
    account: {
      full_name: string;
      email: string;
      phone_number: string;
    };
  };
}

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
      receipt_image?: string;
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
