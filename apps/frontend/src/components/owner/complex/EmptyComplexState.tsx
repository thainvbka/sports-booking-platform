import { Button } from "@/components/ui/button";
import { ComplexFormDialog } from "@/components/shared/complex/ComplexFormDialog";
import { Building2, LayoutGrid, X } from "lucide-react";

interface EmptyComplexStateProps {
  hasQuery: boolean;
  onReset: () => void;
}

export function EmptyComplexState({
  hasQuery,
  onReset,
}: EmptyComplexStateProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/70 bg-gradient-to-br from-muted/40 via-background to-muted/10 px-6 py-14 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-12 size-48 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 left-6 size-48 rounded-full bg-accent-sport/10 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-md flex-col items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          {hasQuery ? (
            <LayoutGrid className="size-6" />
          ) : (
            <Building2 className="size-6" />
          )}
        </div>
        <h3 className="font-display text-lg font-bold italic tracking-tight text-foreground">
          {hasQuery ? "Không tìm thấy kết quả" : "Chưa có khu phức hợp nào"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {hasQuery
            ? "Thử xóa bộ lọc, đổi từ khóa, hoặc chọn trạng thái khác để xem thêm khu phức hợp."
            : "Bắt đầu bằng việc tạo khu phức hợp đầu tiên — bạn có thể thêm sân con và bảng giá sau."}
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {hasQuery ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="rounded-full"
            >
              <X data-icon="inline-start" />
              Xóa bộ lọc
            </Button>
          ) : null}
          <ComplexFormDialog />
        </div>
      </div>
    </div>
  );
}
