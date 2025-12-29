// src/pages/owner/stripe/StripeReturnPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ownerService } from "@/services/owner.service";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export function StripeReturnPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "incomplete">(
    "loading"
  );

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // lấy trạng thái oboarding từ backend
        const data = await ownerService.getStripeStatus();

        if (data.isComplete) {
          setStatus("success");
          setTimeout(() => navigate("/owner"), 2000);
        } else {
          setStatus("incomplete");
        }
      } catch (error) {
        setStatus("incomplete");
      }
    };
    checkStatus();
  }, [navigate]);

  // xử lý khi người dùng nhấn thử lại
  const handleRetry = async () => {
    try {
      setStatus("loading");
      const data = await ownerService.createStripeLink();
      window.location.href = data.url;
    } catch (error) {
      toast.error(
        "Đã có lỗi xảy ra khi tạo liên kết Stripe. Vui lòng thử lại sau."
      );
      setStatus("incomplete");
    }
  };

  if (status === "loading") {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Đang kiểm tra hồ sơ...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-4 animate-in fade-in">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-green-600">
          Kết nối thành công!
        </h1>
        <p className="text-muted-foreground">
          Tài khoản của bạn đã sẵn sàng nhận tiền.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Đang chuyển hướng về Dashboard...
        </p>
      </div>
    );
  }

  // Trường hợp chưa hoàn thành (incomplete)
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center p-4 animate-in fade-in">
      <XCircle className="w-16 h-16 text-yellow-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-800">Chưa hoàn tất hồ sơ</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Bạn chưa cung cấp đầy đủ thông tin ngân hàng hoặc đã hủy quá trình đăng
        ký.
        <br />
        Bạn cần hoàn tất bước này để có thể nhận doanh thu.
      </p>

      <div className="flex gap-4">
        <Button onClick={() => navigate("/owner")} variant="outline">
          Để sau
        </Button>
        <Button onClick={handleRetry} className="bg-primary">
          Tiếp tục khai báo
        </Button>
      </div>
    </div>
  );
}
