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

export interface AdminOwnerWalletRecord {
  id: string;
  company_name: string;
  bankDetails: BankDetails;
  balances: {
    pending: number;
    requested: number;
    paid: number;
  };
  account: {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
  };
}
