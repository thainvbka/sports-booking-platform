import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  payoutService,
} from "@/services/payout.service";
import type { AdminPayoutBatchRecord, PayoutStatus } from "@/types";

export function usePayoutBatches(activeTab: "requests" | "wallets") {
  const [batches, setBatches] = useState<AdminPayoutBatchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedBatch, setSelectedBatch] = useState<AdminPayoutBatchRecord | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const loadPayoutBatches = async () => {
    setIsLoading(true);
    try {
      const filter =
        statusFilter === "ALL" ? undefined : (statusFilter as PayoutStatus);
      const response = await payoutService.adminGetPayoutBatches(filter);
      if (response.success && response.data) {
        setBatches(response.data);
      }
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      toast.error(
        errorResponse.response?.data?.message || "Không thể tải danh sách đợt chi trả",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "requests") {
      loadPayoutBatches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, activeTab]);

  const handleProcessBatch = async (batchId: string) => {
    setIsSubmitting(true);
    try {
      const response = await payoutService.adminProcessPayoutBatch(batchId);
      if (response.success) {
        toast.success("Đợt chi trả đã chuyển sang trạng thái Đang xử lý");
        loadPayoutBatches();
        setDetailOpen(false);
      }
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      toast.error(
        errorResponse.response?.data?.message || "Không thể bắt đầu xử lý đợt chi",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveBatch = async (
    transactionRef: string,
    adminNote: string,
  ) => {
    if (!selectedBatch) return;

    setIsSubmitting(true);
    try {
      const response = await payoutService.adminApprovePayoutBatch(
        selectedBatch.id,
        {
          transaction_ref: transactionRef,
          note: adminNote || undefined,
        },
      );

      if (response.success) {
        toast.success(
          "Phê duyệt quyết toán thành công! Trạng thái đã chuyển thành PAID.",
        );
        setApproveOpen(false);
        setDetailOpen(false);
        loadPayoutBatches();
      }
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      toast.error(errorResponse.response?.data?.message || "Phê duyệt chi trả thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBatch = async (adminNote: string) => {
    if (!selectedBatch) return;

    setIsSubmitting(true);
    try {
      const response = await payoutService.adminCancelPayoutBatch(
        selectedBatch.id,
        adminNote,
      );
      if (response.success) {
        toast.success(
          "Từ chối và hủy đợt chi thành công! Số dư đã trả về ví chủ sân.",
        );
        setCancelOpen(false);
        setDetailOpen(false);
        loadPayoutBatches();
      }
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      toast.error(errorResponse.response?.data?.message || "Từ chối đợt chi thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      const ownerName = batch.owner?.company_name || "";
      const bankName = batch.owner?.bank_name || "";
      const bankNum = batch.owner?.bank_account_number || "";
      const email = batch.owner?.account?.email || "";
      const s = searchTerm.toLowerCase();

      return (
        ownerName.toLowerCase().includes(s) ||
        bankName.toLowerCase().includes(s) ||
        bankNum.includes(s) ||
        email.toLowerCase().includes(s)
      );
    });
  }, [batches, searchTerm]);

  return {
    batches,
    isLoading,
    isSubmitting,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    filteredBatches,
    loadPayoutBatches,
    handleProcessBatch,
    handleApproveBatch,
    handleCancelBatch,
    selectedBatch,
    setSelectedBatch,
    detailOpen,
    setDetailOpen,
    approveOpen,
    setApproveOpen,
    cancelOpen,
    setCancelOpen,
  };
}
