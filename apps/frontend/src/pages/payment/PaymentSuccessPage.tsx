import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // lấy session_id từ query param
  const sessionId = searchParams.get("session_id");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <div className="text-green-500 mb-4">
        <svg
          className="w-20 h-20"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-2">Thanh toán thành công!</h1>
      <p className="text-muted-foreground mb-6">
        Cảm ơn bạn đã đặt sân. Mã giao dịch: {sessionId?.slice(-8)}...
      </p>
      <div className="flex gap-4">
        <Button onClick={() => navigate("/search")}>Tiếp tục đặt sân</Button>
        <Button variant="outline" onClick={() => navigate("/bookings")}>
          Xem lịch sử đặt
        </Button>
      </div>
    </div>
  );
}
