// src/pages/auth/VerifyEmailPage.tsx

import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { verifyEmail, isLoading, error, isAuthenticated } = useAuthStore();
  const calledRef = useRef(false); // Tránh React.StrictMode gọi API 2 lần

  useEffect(() => {
    if (!token) return;
    if (calledRef.current) return; // Đã gọi rồi thì thôi

    calledRef.current = true;

    // Gọi action trong store
    verifyEmail(token)
      .then((user) => {
        setTimeout(() => {
          if (user.roles.includes("OWNER")) {
            navigate("/owner");
          }
          if (user.roles.includes("PLAYER")) {
            navigate("/");
          }
          if (user.roles.includes("ADMIN")) {
            navigate("/admin");
          }
        }, 3000);
      })
      .catch(() => {
        // Lỗi đã được store handle vào state error
      });
  }, [token, verifyEmail, navigate]);

  if (!token) {
    return <div className="text-center text-red-500">Token không hợp lệ.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in">
      {isLoading ? (
        <>
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <h2 className="text-2xl font-semibold">Đang xác thực tài khoản...</h2>
          <p className="text-muted-foreground">Vui lòng chờ trong giây lát.</p>
        </>
      ) : error ? (
        <>
          <XCircle className="w-16 h-16 text-destructive" />
          <h2 className="text-2xl font-semibold text-destructive">
            Xác thực thất bại
          </h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate("/auth/login")} className="mt-4">
            Về trang đăng nhập
          </Button>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-16 h-16 text-green-500" />
          <h2 className="text-2xl font-semibold text-green-600">
            Xác thực thành công!
          </h2>
          <p className="text-muted-foreground">
            Tài khoản đã được kích hoạt. Đang chuyển hướng vào trang chủ...
          </p>
        </>
      )}
    </div>
  );
}
