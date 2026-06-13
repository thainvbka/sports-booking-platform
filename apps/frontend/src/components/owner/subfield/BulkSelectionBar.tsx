import { Button } from "@/components/ui/button";

interface BulkSelectionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onCancel: () => void;
}

export function BulkSelectionBar({
  selectedCount,
  onDelete,
  onCancel,
}: BulkSelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-primary/20 bg-background/95 px-4 py-2 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300">
      <span className="text-xs font-semibold text-foreground">
        Đã chọn <span className="font-bold text-primary tabular-nums">{selectedCount}</span> khung giờ
      </span>
      <div className="h-4 w-[1px] bg-border" />
      <Button
        variant="destructive"
        size="sm"
        className="h-7 rounded-full text-[11px] font-bold px-3 cursor-pointer"
        onClick={onDelete}
      >
        Xóa tất cả
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 rounded-full text-[11px] font-bold px-3 text-muted-foreground hover:text-foreground cursor-pointer"
        onClick={onCancel}
      >
        Hủy
      </Button>
    </div>
  );
}
