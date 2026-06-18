import { payoutService, type OwnerWalletResponse } from "@/services/payout.service";
import { mapToBankBin } from "@/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useWallet() {
  const [wallet, setWallet] = useState<OwnerWalletResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for bank details
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankBranch, setBankBranch] = useState("");

  const fetchWalletData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await payoutService.getOwnerWallet();
      if (response.success && response.data) {
        setWallet(response.data);
        const bankDetails = response.data.bankDetails;
        setBankName(mapToBankBin(bankDetails?.bank_name || ""));
        setBankAccountNumber(bankDetails?.bank_account_number || "");
        setBankAccountName(bankDetails?.bank_account_name || "");
        setBankBranch(bankDetails?.bank_branch || "");
      }
    } catch (err: unknown) {
      console.error("Failed to load wallet data:", err);
      const errorResponse = err as { response?: { data?: { message?: string } } };
      toast.error(errorResponse.response?.data?.message || "Không thể tải thông tin ví");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleRequestPayout = async () => {
    if (!wallet) return;

    if (!wallet.bankDetails?.bank_name || !wallet.bankDetails?.bank_account_number) {
      toast.error("Bạn phải cập nhật thông tin tài khoản ngân hàng trước khi gửi yêu cầu chi trả.");
      return;
    }

    if (wallet.balances.pending <= 0) {
      toast.error("Bạn không có số dư khả dụng (Tích lũy) để gửi yêu cầu chi trả.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await payoutService.requestPayout();
      if (response.success) {
        toast.success("Gửi yêu cầu chi trả thành công! Chờ Admin phê duyệt.");
        fetchWalletData(true);
      }
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      toast.error(errorResponse.response?.data?.message || "Gửi yêu cầu rút tiền thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasConfiguredBank = Boolean(
    wallet?.bankDetails?.bank_name &&
    wallet?.bankDetails?.bank_account_number &&
    wallet?.bankDetails?.bank_account_name
  );

  return {
    wallet,
    isLoading,
    isSubmitting,
    setIsSubmitting,
    fetchWalletData,
    handleRequestPayout,
    hasConfiguredBank,
    initialBankDetails: {
      bankName,
      bankAccountNumber,
      bankAccountName,
      bankBranch,
    },
  };
}
