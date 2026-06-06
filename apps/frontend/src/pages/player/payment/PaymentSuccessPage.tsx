import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useSearchParams } from "react-router-dom";
import { bookingService } from "@/services/booking.service";
import { Loader2, CheckCircle2, XCircle, Calendar, ArrowRight, ShieldCheck, FileText } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/utils";

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [transactionId, setTransactionId] = useState<string>("");
  const [provider, setProvider] = useState<"Stripe" | "VNPAY">("Stripe");
  const [amount, setAmount] = useState<number | null>(null);
  
  const hasCalled = useRef(false);

  useEffect(() => {
    const isVnpay = searchParams.has("vnp_TxnRef");

    if (isVnpay) {
      setProvider("VNPAY");
      const txnRef = searchParams.get("vnp_TxnRef") || "";
      const vnpAmount = searchParams.get("vnp_Amount");
      const responseCode = searchParams.get("vnp_ResponseCode");
      
      setTransactionId(txnRef);
      if (vnpAmount) {
        setAmount(Number(vnpAmount) / 100); // VNPAY amount is multiplied by 100
      }

      // 1. Kiểm tra ngay nếu VNPAY báo lỗi hoặc khách hàng hủy thanh toán (ResponseCode !== "00")
      if (responseCode && responseCode !== "00") {
        setStatus("failed");
        toast.error("Giao dịch VNPAY đã bị hủy hoặc không thành công.");
        
        // Gọi âm thầm API backend để cập nhật DB chuyển trạng thái payment sang FAILED
        if (!hasCalled.current) {
          hasCalled.current = true;
          bookingService.verifyVnpayPayment(window.location.search).catch((err) => {
            console.error("VNPAY backend fail update error:", err);
          });
        }
        return;
      }

      if (hasCalled.current) return;
      hasCalled.current = true;

      // 2. Gửi toàn bộ query string về backend để xác thực chữ ký và cập nhật DB (Trường hợp thành công)
      bookingService.verifyVnpayPayment(window.location.search)
        .then((res) => {
          // RspCode "00" = Giao dịch thành công mới
          // RspCode "02" = Giao dịch đã được xác nhận thành công từ trước (do StrictMode gọi 2 lần hoặc reload trang)
          if (res.RspCode === "00" || res.RspCode === "02") {
            setStatus("success");
            toast.success("Thanh toán qua VNPAY thành công!");
          } else {
            setStatus("failed");
            toast.error(res.Message || "Xác thực giao dịch VNPAY thất bại.");
          }
        })
        .catch((err) => {
          console.error("VNPAY verification error:", err);
          setStatus("failed");
          toast.error("Đã xảy ra lỗi khi xác thực giao dịch với máy chủ.");
        });
    } else {
      // Luồng Stripe
      setProvider("Stripe");
      const sessionId = searchParams.get("session_id") || "";
      setTransactionId(sessionId);
      setStatus("success");
    }
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 relative overflow-hidden bg-background">
        {/* Glow Decorator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-accent-sport/10 blur-[120px] pointer-events-none" />
        
        <Card className="relative z-10 max-w-md w-full border border-border bg-card/60 backdrop-blur-lg shadow-2xl">
          <CardHeader className="space-y-4 pt-8">
            <Loader2 className="w-14 h-14 animate-spin text-accent-sport mx-auto" />
            <CardTitle className="text-2xl font-bold tracking-tight">Đang xác thực giao dịch</CardTitle>
            <CardDescription className="text-muted-foreground text-sm leading-relaxed px-2">
              Hệ thống đang tiến hành đối soát chữ ký số an toàn với đối tác {provider} để xác thực giao dịch của bạn. Vui lòng giữ kết nối internet ổn định.
            </CardDescription>
          </CardHeader>
          <div className="pb-8" />
        </Card>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 relative overflow-hidden bg-background">
        {/* Failed Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-destructive/10 blur-[120px] pointer-events-none" />
        
        <Card className="relative z-10 max-w-md w-full border border-destructive/20 bg-card/60 backdrop-blur-lg shadow-2xl">
          <CardHeader className="space-y-4 pt-8">
            <div className="w-16 h-16 bg-destructive/10 border border-destructive/20 rounded-full flex items-center justify-center mx-auto text-destructive animate-pulse">
              <XCircle className="w-10 h-10" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-foreground">Thanh toán thất bại</CardTitle>
            <CardDescription className="text-muted-foreground text-sm leading-relaxed px-4">
              Giao dịch qua {provider} của bạn đã bị từ chối, hết hạn hoặc không thể xác thực được chữ ký bảo mật. Tài khoản của bạn chưa bị trừ tiền.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-6 py-2">
            {transactionId && (
              <div className="p-3 bg-muted/60 rounded-lg text-xs font-mono text-muted-foreground border border-border/85 text-center">
                Mã tham chiếu: {transactionId}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 px-6 pb-6 pt-2">
            <Button className="w-full sm:flex-1 bg-foreground text-background hover:bg-foreground/90 font-medium" onClick={() => navigate("/search")}>
              Quay lại đặt sân
            </Button>
            <Button variant="outline" className="w-full sm:flex-1 border-border hover:bg-muted font-medium" onClick={() => navigate("/bookings")}>
              Lịch sử giao dịch
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 relative overflow-hidden bg-background">
      {/* Success Green Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />

      <Card className="relative z-10 max-w-md w-full border border-emerald-500/20 bg-card/75 backdrop-blur-lg shadow-2xl">
        <CardHeader className="space-y-4 pt-8">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-lg shadow-emerald-500/5">
            <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
              Thanh toán thành công!
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm max-w-xs mx-auto px-2">
              Lịch đặt sân của bạn đã được thanh toán an toàn qua cổng {provider} và đã được chuyển đến chủ sân chờ duyệt.
            </CardDescription>
          </div>
        </CardHeader>

        {/* Transaction Detail Card */}
        <CardContent className="px-6 py-2">
          <div className="p-4 bg-muted/40 border border-border/80 rounded-xl space-y-3.5 text-left text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Cổng thanh toán
              </span>
              <Badge variant="secondary" className="font-semibold text-xs border border-border bg-background">
                {provider}
              </Badge>
            </div>
            
            {amount !== null && (
              <div className="flex justify-between items-center pb-2 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  Tổng thanh toán
                </span>
                <span className="font-bold text-foreground text-base">
                  {formatPrice(amount)}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Mã giao dịch</span>
              <span className="font-mono text-[11px] text-foreground bg-background p-1 px-2.5 rounded border border-border shadow-sm">
                {transactionId ? transactionId.slice(0, 20) : "N/A"}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 px-6 pb-6 pt-2">
          <Button 
            className="w-full sm:flex-1 bg-accent-sport hover:bg-accent-sport/90 text-accent-sport-foreground font-semibold flex items-center justify-center gap-2 group shadow-lg shadow-accent-sport/10"
            onClick={() => navigate("/search")}
          >
            Tiếp tục đặt sân
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button 
            variant="outline" 
            className="w-full sm:flex-1 border-border hover:bg-muted text-foreground flex items-center justify-center gap-2"
            onClick={() => navigate("/bookings")}
          >
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Lịch đặt của tôi
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
