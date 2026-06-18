import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { bookingService } from "@/services/booking.service";
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, ArrowRight, RefreshCw } from "lucide-react";

export function PaymentFailedPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasCancelled = useRef(false);

  // Khi user bị redirect từ Stripe checkout (cancel), thông báo backend reset booking timeout
  useEffect(() => {
    sessionStorage.removeItem("pending_checkout");
    const bookingIdsParam = searchParams.get("booking_ids");
    if (!bookingIdsParam || hasCancelled.current) return;
    hasCancelled.current = true;

    const bookingIds = bookingIdsParam.split(",").filter(Boolean);
    if (bookingIds.length > 0) {
      bookingService.cancelStripeCheckout(bookingIds).catch((err) => {
        console.error("[PaymentFailed] Failed to reset booking timeout:", err);
      });
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 relative overflow-hidden bg-background">
      {/* Failed Red Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-destructive/10 blur-[120px] pointer-events-none" />
      
      <Card className="relative z-10 max-w-md w-full border border-destructive/20 bg-card/60 backdrop-blur-lg shadow-2xl">
        <CardHeader className="space-y-4 pt-8">
          <div className="w-16 h-16 bg-destructive/10 border border-destructive/20 rounded-full flex items-center justify-center mx-auto text-destructive animate-pulse">
            <XCircle className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl font-extrabold text-foreground">Thanh toán thất bại</CardTitle>
          <CardDescription className="text-muted-foreground text-sm leading-relaxed px-4">
            Giao dịch thanh toán của bạn đã bị từ chối, hết hạn hoặc bị hủy bỏ. Số dư khả dụng của bạn chưa bị trừ tiền.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 py-2">
          <div className="p-4 bg-muted/40 border border-border/80 rounded-xl text-left text-sm space-y-2">
            <p className="text-muted-foreground text-xs leading-normal">
              💡 **Gợi ý xử lý:**
            </p>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
              <li>Kiểm tra lại số dư hoặc hạn mức thẻ của bạn.</li>
              <li>Đảm bảo thông tin thẻ (số thẻ, OTP) nhập chính xác.</li>
              <li>Thử lại bằng phương thức thanh toán khác (VNPAY / Stripe).</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 px-6 pb-6 pt-2">
          <Button 
            className="w-full sm:flex-1 bg-foreground text-background hover:bg-foreground/90 font-medium flex items-center justify-center gap-2" 
            onClick={() => navigate("/search")}
          >
            Quay lại đặt sân
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            className="w-full sm:flex-1 border-border hover:bg-muted font-medium flex items-center justify-center gap-2" 
            onClick={() => navigate(-1)}
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
            Thử thanh toán lại
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
