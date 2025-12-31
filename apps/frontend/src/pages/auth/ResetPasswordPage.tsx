import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type resetPasswordInput,
} from "@sports-booking-platform/validation";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<resetPasswordInput & { confirmPassword: string }>({
    resolver: zodResolver(
      resetPasswordSchema.shape.body.extend({
        confirmPassword: resetPasswordSchema.shape.body.shape.new_password,
      })
    ),
  });

  const newPassword = watch("new_password");

  const onSubmit = async (data: resetPasswordInput) => {
    if (!token) {
      toast.error("Token không hợp lệ");
      return;
    }

    // Validate password confirmation
    if (data.new_password !== (data as any).confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword(token, data.new_password);
      toast.success("Đặt lại mật khẩu thành công!");
      
      // Redirect to login after 1.5 seconds
      setTimeout(() => {
        navigate("/auth/login");
      }, 1500);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Có lỗi xảy ra. Vui lòng thử lại."
      );
      console.error("Reset password failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Đặt lại mật khẩu
        </h1>
        <p className="text-sm text-muted-foreground">
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new_password">Mật khẩu mới</Label>
          <Input
            id="new_password"
            type="password"
            autoComplete="new-password"
            disabled={isLoading}
            placeholder="Nhập mật khẩu mới"
            className="h-11 bg-background/50 backdrop-blur-sm transition-all focus:ring-2 focus:ring-primary/20"
            {...register("new_password")}
          />
          {errors.new_password && (
            <p className="text-sm text-destructive font-medium animate-in slide-in-from-left-1">
              {errors.new_password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Nhập lại mật khẩu</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            disabled={isLoading}
            placeholder="Nhập lại mật khẩu mới"
            className="h-11 bg-background/50 backdrop-blur-sm transition-all focus:ring-2 focus:ring-primary/20"
            {...register("confirmPassword", {
              validate: (value) =>
                value === newPassword || "Mật khẩu xác nhận không khớp",
            })}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive font-medium animate-in slide-in-from-left-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang đặt lại mật khẩu...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Đặt lại mật khẩu
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
