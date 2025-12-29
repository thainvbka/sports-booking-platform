import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  type loginInput,
} from "@sports-booking-platform/validation";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<loginInput>({
    resolver: zodResolver(loginSchema.shape.body),
  });

  const onSubmit = async (data: loginInput) => {
    try {
      await login(data);
      const user = useAuthStore.getState().user;

      if (user?.roles.includes("ADMIN")) {
        navigate("/admin");
      } else if (user?.roles.includes("PLAYER")) {
        navigate("/");
      } else if (user?.roles.includes("OWNER")) {
        navigate("/owner");
      }
    } catch (err) {
      toast.error(
        "Đăng nhập thất bại. Vui lòng kiểm tra thông tin và thử lại."
      );
      // Error is handled in store
      console.error("Login failed", err);
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Chào mừng trở lại
        </h1>
        <p className="text-sm text-muted-foreground">
          Nhập email để đăng nhập vào tài khoản của bạn
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mật khẩu</Label>
            <Link
              // to="/auth/forgot-password"
              to="#"
              className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            disabled={isLoading}
            className="h-11 bg-background/50 backdrop-blur-sm transition-all focus:ring-2 focus:ring-primary/20"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive font-medium animate-in slide-in-from-left-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm text-center font-medium animate-in zoom-in-95">
            {error}
          </div>
        )}

        <Button
          className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang đăng nhập...
            </>
          ) : (
            "Đăng nhập"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Chưa có tài khoản? </span>
        <Link
          to="/auth/register"
          className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
        >
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}
