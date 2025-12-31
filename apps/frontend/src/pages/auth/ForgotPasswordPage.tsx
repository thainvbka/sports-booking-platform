import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type forgotPasswordInput,
} from "@sports-booking-platform/validation";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<forgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema.shape.body),
  });

  const onSubmit = async (data: forgotPasswordInput) => {
    try {
      setIsLoading(true);
      await authService.forgotPassword(data.email);
      setEmailSent(true);
      toast.success("Vui lòng kiểm tra email của bạn để đặt lại mật khẩu");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Có lỗi xảy ra. Vui lòng thử lại sau."
      );
      console.error("Forgot password failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Kiểm tra email của bạn
            </h1>
            <p className="text-sm text-muted-foreground max-w-md">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.
              Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn.
            </p>
          </div>
          <Link to="/auth/login" className="w-full">
            <Button
              variant="outline"
              className="w-full h-11 text-base font-medium"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại đăng nhập
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Quên mật khẩu?
        </h1>
        <p className="text-sm text-muted-foreground">
          Nhập email của bạn để đặt lại mật khẩu.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="name@example.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            disabled={isLoading}
            className="h-11 bg-background/50 backdrop-blur-sm transition-all focus:ring-2 focus:ring-primary/20"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive font-medium animate-in slide-in-from-left-1">
              {errors.email.message}
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
              Đang gửi...
            </>
          ) : (
            "Đặt lại mật khẩu."
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/auth/login"
          className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors inline-flex items-center"
        >
          <ArrowLeft className="mr-1 h-3 w-3" />
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
