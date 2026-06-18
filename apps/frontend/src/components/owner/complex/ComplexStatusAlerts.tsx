import { ComplexStatus } from "@/types";
import { Clock, Ban, ShieldAlert } from "lucide-react";
import { StatusRibbon } from "./StatusRibbon";

interface ComplexStatusAlertsProps {
  status?: ComplexStatus;
}

export function ComplexStatusAlerts({ status }: ComplexStatusAlertsProps) {
  if (!status) return null;

  return (
    <div className="flex flex-col gap-2">
      {status === ComplexStatus.PENDING && (
        <StatusRibbon
          tone="amber"
          icon={Clock}
          title="Đang chờ phê duyệt"
          description="Khu phức hợp đang chờ admin xét duyệt. Bạn sẽ có thể thêm sân con ngay khi yêu cầu được chấp thuận."
        />
      )}

      {status === ComplexStatus.INACTIVE && (
        <StatusRibbon
          tone="slate"
          icon={Ban}
          title="Khu phức hợp đã ngừng hoạt động"
          description="Khách hàng không thể xem hoặc đặt lịch tại đây. Bạn có thể kích hoạt lại bất cứ lúc nào từ thanh thao tác phía trên."
        />
      )}

      {status === ComplexStatus.REJECTED && (
        <StatusRibbon
          tone="rose"
          icon={ShieldAlert}
          title="Yêu cầu đã bị từ chối"
          description="Khu phức hợp không được chấp thuận. Vui lòng liên hệ quản trị viên để biết lý do và các bước tiếp theo."
        />
      )}
    </div>
  );
}
