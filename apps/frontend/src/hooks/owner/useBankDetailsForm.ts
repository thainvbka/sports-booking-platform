import { useEffect, useState } from "react";
import { payoutService } from "@/services/payout.service";
import type { OwnerWalletResponse } from "@/types";
import { mapToBankBin } from "@/utils";
import { toast } from "sonner";

interface UseBankDetailsFormProps {
  wallet: OwnerWalletResponse | null;
  onSuccess: () => void;
}

export function useBankDetailsForm({ wallet, onSuccess }: UseBankDetailsFormProps) {
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when wallet changes
  useEffect(() => {
    if (wallet?.bankDetails) {
      const bankDetails = wallet.bankDetails;
      setBankName(mapToBankBin(bankDetails.bank_name || ""));
      setBankAccountNumber(bankDetails.bank_account_number || "");
      setBankAccountName(bankDetails.bank_account_name || "");
      setBankBranch(bankDetails.bank_branch || "");
    }
  }, [wallet]);

  const handleUpdateBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !bankAccountNumber.trim() || !bankAccountName.trim()) {
      toast.error("Vui lòng nhập đầy đủ các trường thông tin bắt buộc.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await payoutService.updateBankDetails({
        bank_name: bankName,
        bank_account_number: bankAccountNumber,
        bank_account_name: bankAccountName.toUpperCase(),
        bank_branch: bankBranch || undefined,
      });

      if (response.success) {
        toast.success("Cập nhật thông tin tài khoản ngân hàng thành công.");
        setIsEditingBank(false);
        onSuccess();
      }
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      toast.error(errorResponse.response?.data?.message || "Không thể cập nhật tài khoản ngân hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    bankName,
    setBankName,
    bankAccountNumber,
    setBankAccountNumber,
    bankAccountName,
    setBankAccountName,
    bankBranch,
    setBankBranch,
    isEditingBank,
    setIsEditingBank,
    isSubmitting,
    handleUpdateBankDetails,
  };
}
