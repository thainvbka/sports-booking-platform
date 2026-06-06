import { LoadingState } from "@/components/shared/ui-utility/LoadingState";
import { ownerService } from "@/services/owner.service";
import { useEffect } from "react";

export function StripeRefreshPage() {
  useEffect(() => {
    // Tự động gọi API lấy link mới
    const refreshLink = async () => {
      try {
        const data = await ownerService.createStripeLink();
        // Redirect sang Stripe ngay lập tức
        window.location.href = data.data.url;
      } catch (error) {
        console.error("Lỗi refresh link:", error);
        // Nếu lỗi thì quay về dashboard
        window.location.href = "/owner";
      }
    };
    refreshLink();
  }, []);

  return (
    <LoadingState variant="fullscreen" text="Đang kết nối lại với Stripe..." />
  );
}
