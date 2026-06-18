import { Button } from "@/components/ui/button";
import { ComplexStatus, type ComplexDetail } from "@/types";
import { RotateCcw, Pencil, FileText, PowerOff } from "lucide-react";

interface ComplexHeaderActionsProps {
  complex: ComplexDetail | null;
  onEdit: () => void;
  onLegalDocs: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
}

export function ComplexHeaderActions({
  complex,
  onEdit,
  onLegalDocs,
  onDeactivate,
  onReactivate,
}: ComplexHeaderActionsProps) {
  if (!complex) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {complex.status === ComplexStatus.INACTIVE ? (
        <Button
          size="sm"
          onClick={onReactivate}
          className="h-9 rounded-full bg-emerald-600 px-4 text-xs font-semibold text-white shadow shadow-emerald-600/25 hover:bg-emerald-600/90"
        >
          <RotateCcw data-icon="inline-start" />
          Kích hoạt lại
        </Button>
      ) : (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="h-9 rounded-full border-border/70 bg-background/70 px-4 text-xs font-semibold backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <Pencil data-icon="inline-start" />
            Chỉnh sửa
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onLegalDocs}
            className="h-9 rounded-full border-border/70 bg-background/70 px-4 text-xs font-semibold backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <FileText data-icon="inline-start" />
            Tài liệu pháp lý
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDeactivate}
            className="h-9 rounded-full border-destructive/30 bg-destructive/5 px-4 text-xs font-semibold text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
          >
            <PowerOff data-icon="inline-start" />
            Ngừng hoạt động
          </Button>
        </>
      )}
    </div>
  );
}
