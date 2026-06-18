import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import type { AdminComplex } from "@/types/admin.types";

interface ComplexApprovalActionsProps {
  complex: AdminComplex;
  onStatusUpdate: (id: string, status: string) => void;
  onClose: () => void;
}

export function ComplexApprovalActions({
  complex,
  onStatusUpdate,
  onClose,
}: ComplexApprovalActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2 border-t border-border/60 pt-4">
      <Button variant="outline" onClick={onClose}>
        Đóng
      </Button>
      {complex.status === "PENDING" && (
        <>
          <Button
            variant="destructive"
            onClick={() => {
              onStatusUpdate(complex.id, "REJECTED");
              onClose();
            }}
          >
            <XCircle data-icon="inline-start" />
            Từ chối
          </Button>
          <Button
            onClick={() => {
              onStatusUpdate(complex.id, "ACTIVE");
              onClose();
            }}
          >
            <CheckCircle data-icon="inline-start" />
            Phê duyệt ngay
          </Button>
        </>
      )}
    </div>
  );
}
