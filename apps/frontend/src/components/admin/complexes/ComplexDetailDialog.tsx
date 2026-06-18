import {
  AdminDetailDialog,
  DetailInfoCard,
  DetailSummaryRow,
} from "@/components/admin/details/AdminDetailDialog";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { COMPLEX_STATUS_COLORS, COMPLEX_STATUS_LABELS } from "@/lib/constants";
import { formatDateVn, formatPrice, sportLabel } from "@/utils";
import type { AdminComplex } from "@/types/admin.types";
import { LegalDocumentsGrid } from "./LegalDocumentsGrid";
import { ComplexApprovalActions } from "./ComplexApprovalActions";

interface ComplexDetailDialogProps {
  complex: AdminComplex | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (id: string, status: string) => void;
  docUrls: string[];
}

export function ComplexDetailDialog({
  complex,
  open,
  onOpenChange,
  onStatusUpdate,
  docUrls,
}: ComplexDetailDialogProps) {
  return (
    <AdminDetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Hồ sơ xác thực: ${complex?.complex_name || "-"}`}
      icon={FileText}
      statusLabel={
        complex
          ? COMPLEX_STATUS_LABELS[complex.status]
          : undefined
      }
      statusClassName={
        complex
          ? COMPLEX_STATUS_COLORS[complex.status]
          : undefined
      }
      contentClassName="max-w-3xl"
    >
      {complex && (
        <div className="max-h-[70vh] space-y-6 overflow-y-auto bg-background p-6">
          <DetailSummaryRow
            leftLabel="Tên khu phức hợp"
            leftValue={
              <p className="font-display text-lg font-bold italic tracking-tight text-foreground">
                {complex.complex_name}
              </p>
            }
            rightLabel="Địa chỉ"
            rightValue={
              <p className="wrap-break-word max-w-80 text-xs font-medium text-foreground">
                {complex.complex_address}
              </p>
            }
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailInfoCard
              label="Chủ sở hữu"
              value={complex.owner.account.full_name}
              helper={complex.owner.company_name}
            />
            <DetailInfoCard
              label="Liên hệ"
              value={complex.owner.account.email}
              helper={complex.owner.account.phone_number}
            />
            <DetailInfoCard
              label="Ngày đăng ký"
              value={formatDateVn(
                complex.created_at,
                "dd/MM/yyyy HH:mm",
              )}
            />
            <DetailInfoCard
              label="Số sân con"
              value={complex.total_subfields}
            />
            <DetailInfoCard
              label="Đánh giá trung bình"
              value={
                complex.avg_rating
                  ? Number(complex.avg_rating).toFixed(1)
                  : "Chưa có"
              }
              helper={`Tổng đánh giá: ${complex.total_reviews || 0}`}
            />
            <DetailInfoCard
              label="Khoảng giá"
              value={`${formatPrice(complex.min_price || 0)} - ${formatPrice(complex.max_price || 0)}`}
            />
          </div>

          <div className="rounded-lg border border-border/60 p-4">
            <p className="mb-2 text-[10px] font-bold uppercase text-muted-foreground">
              Môn thể thao khả dụng
            </p>
            <div className="flex flex-wrap gap-2">
              {complex.sport_types.length > 0 ? (
                complex.sport_types.map((type) => (
                  <Badge key={type} variant="secondary">
                    {sportLabel(type)}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">
                  Chưa có dữ liệu
                </span>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border/60 p-4">
            <p className="mb-2 text-[10px] font-bold uppercase text-muted-foreground">
              Tài liệu pháp lý
            </p>
            <LegalDocumentsGrid docUrls={docUrls} />
          </div>

          <ComplexApprovalActions
            complex={complex}
            onStatusUpdate={onStatusUpdate}
            onClose={() => onOpenChange(false)}
          />
        </div>
      )}
    </AdminDetailDialog>
  );
}
