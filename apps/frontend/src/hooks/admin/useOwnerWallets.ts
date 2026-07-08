import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { payoutService } from "@/services/payout.service";
import type { AdminOwnerWalletRecord } from "@/types";

export function useOwnerWallets(activeTab: "requests" | "wallets") {
  const [wallets, setWallets] = useState<AdminOwnerWalletRecord[]>([]);
  const [isWalletsLoading, setIsWalletsLoading] = useState(false);
  const [walletSearchTerm, setWalletSearchTerm] = useState("");

  const loadOwnerWallets = async () => {
    setIsWalletsLoading(true);
    try {
      const response = await payoutService.adminGetOwnerWallets();
      if (response.success && response.data) {
        setWallets(response.data);
      }
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      toast.error(
        errorResponse.response?.data?.message || "Không thể tải danh sách ví chủ sân",
      );
    } finally {
      setIsWalletsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "wallets") {
      loadOwnerWallets();
    }
  }, [activeTab]);

  const filteredWallets = useMemo(() => {
    return wallets.filter((w) => {
      const ownerName = w.company_name || "";
      const bankName = w.bankDetails?.bank_name || "";
      const bankNum = w.bankDetails?.bank_account_number || "";
      const email = w.account?.email || "";
      const s = walletSearchTerm.toLowerCase();

      return (
        ownerName.toLowerCase().includes(s) ||
        bankName.toLowerCase().includes(s) ||
        bankNum.includes(s) ||
        email.toLowerCase().includes(s)
      );
    });
  }, [wallets, walletSearchTerm]);

  return {
    wallets,
    isWalletsLoading,
    walletSearchTerm,
    setWalletSearchTerm,
    filteredWallets,
    loadOwnerWallets,
  };
}
