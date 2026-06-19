import { EmptyState } from "@/components/shared/ui-utility/EmptyState";
import { ComplexFormDialog } from "@/components/shared/complex/ComplexFormDialog";
import { Button } from "@/components/ui/button";
import { Building2, LayoutGrid, RotateCcw } from "lucide-react";

interface EmptyComplexStateProps {
  hasQuery: boolean;
  onReset: () => void;
}

export function EmptyComplexState({
  hasQuery,
  onReset,
}: EmptyComplexStateProps) {
  return (
    <EmptyState
      title={hasQuery ? "Không tìm thấy kết quả" : "Chưa có khu phức hợp nào"}
      description={
        hasQuery
          ? "Thử xóa bộ lọc, đổi từ khóa, hoặc chọn trạng thái khác để xem thêm khu phức hợp."
          : "Bắt đầu bằng việc tạo khu phức hợp đầu tiên — bạn có thể thêm sân con và bảng giá sau."
      }
      icon={
        hasQuery ? (
          <LayoutGrid className="size-6 text-primary" />
        ) : (
          <Building2 className="size-6 text-primary" />
        )
      }
      className="relative overflow-hidden bg-gradient-to-br from-muted/40 via-background to-muted/10 py-14"
    >
      {/* Decorative gradient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-12 size-48 rounded-full bg-primary/10 blur-3xl animate-pulse"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 left-6 size-48 rounded-full bg-accent-sport/10 blur-3xl animate-pulse"
      />

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2 relative z-10">
        {hasQuery ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="rounded-full"
          >
            <RotateCcw data-icon="inline-start" />
            Xóa bộ lọc
          </Button>
        ) : null}
        <ComplexFormDialog />
      </div>
    </EmptyState>
  );
}
