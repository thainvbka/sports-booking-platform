// src/pages/owner/stripe/StripeRefreshPage.tsx
import { useEffect } from "react";
import { ownerService } from "@/services/owner.service";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function StripeRefreshPage() {
  useEffect(() => {
    // Tự động gọi API lấy link mới
    const refreshLink = async () => {
      try {
        const data = await ownerService.createStripeLink();
        // Redirect sang Stripe ngay lập tức
        window.location.href = data.url;
      } catch (error) {
        console.error("Lỗi refresh link:", error);
        // Nếu lỗi thì quay về dashboard
        window.location.href = "/owner";
      }
    };
    refreshLink();
  }, []);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">
        Đang kết nối lại với Stripe...
      </p>
    </div>
  );
}
