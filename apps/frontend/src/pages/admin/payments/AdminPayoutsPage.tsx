import { ApprovePayoutDialog } from "@/components/admin/payments/ApprovePayoutDialog";
import { BatchDetailDialog } from "@/components/admin/payments/BatchDetailDialog";
import { CancelPayoutDialog } from "@/components/admin/payments/CancelPayoutDialog";
import { OwnerWalletsTab } from "@/components/admin/payments/OwnerWalletsTab";
import { PayoutRequestsTab } from "@/components/admin/payments/PayoutRequestsTab";
import { AdminPageHeader } from "@/components/admin/shell/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { useOwnerWallets } from "@/hooks/admin/useOwnerWallets";
import { usePayoutBatches } from "@/hooks/admin/usePayoutBatches";
import { useState } from "react";

export default function AdminPayoutsPage() {
  const [activeTab, setActiveTab] = useState<"requests" | "wallets">("requests");

  const {
    batches,
    isLoading: isBatchesLoading,
    isSubmitting,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    filteredBatches,
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
  } = usePayoutBatches(activeTab);

  const {
    wallets,
    isWalletsLoading,
    walletSearchTerm,
    setWalletSearchTerm,
    filteredWallets,
  } = useOwnerWallets(activeTab);

  const pendingCount = batches.filter((b) => b.status === "REQUESTED").length;

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 lg:px-6">
      <AdminPageHeader
        index={5}
        title="Quản lý"
        titleAccent="công nợ"
        description="Duyệt, quyết toán yêu cầu rút tiền từ VNPAY của các chủ sân."
      />

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-border/60 pb-3">
        <Button
          variant={activeTab === "requests" ? "default" : "ghost"}
          className="rounded-full text-xs font-semibold h-8"
          onClick={() => setActiveTab("requests")}
        >
          Yêu cầu chi trả ({pendingCount} chờ duyệt)
        </Button>
        <Button
          variant={activeTab === "wallets" ? "default" : "ghost"}
          className="rounded-full text-xs font-semibold h-8"
          onClick={() => setActiveTab("wallets")}
        >
          Số dư & Ví chủ sân ({wallets.length})
        </Button>
      </div>

      {activeTab === "requests" ? (
        <PayoutRequestsTab
          filteredBatches={filteredBatches}
          isLoading={isBatchesLoading}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onRowClick={(batch) => {
            setSelectedBatch(batch);
            setDetailOpen(true);
          }}
        />
      ) : (
        <OwnerWalletsTab
          filteredWallets={filteredWallets}
          isLoading={isWalletsLoading}
          searchTerm={walletSearchTerm}
          setSearchTerm={setWalletSearchTerm}
        />
      )}

      <BatchDetailDialog
        batch={selectedBatch}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        isSubmitting={isSubmitting}
        onProcess={handleProcessBatch}
        onApprove={() => setApproveOpen(true)}
        onCancel={() => setCancelOpen(true)}
      />

      <ApprovePayoutDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        isSubmitting={isSubmitting}
        onSubmit={handleApproveBatch}
      />

      <CancelPayoutDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        isSubmitting={isSubmitting}
        onSubmit={handleCancelBatch}
      />
    </div>
  );
}
