import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function PaymentFailedPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <div className="text-red-500 mb-4">
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
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-2">Thanh toán thất bại</h1>
      <p className="text-muted-foreground mb-6">
        Giao dịch đã bị hủy hoặc xảy ra lỗi khi thanh toán.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => navigate("/search")}>Tiếp tục đặt sân</Button>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Thanh toán lại
        </Button>
      </div>
    </div>
  );
}
