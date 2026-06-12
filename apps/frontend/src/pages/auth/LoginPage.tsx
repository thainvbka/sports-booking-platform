import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/useAuthStore";
import { loginSchema, type loginInput } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<loginInput>({
    resolver: zodResolver(loginSchema.shape.body),
  });

  const onSubmit = async (data: loginInput) => {
    try {
      const isSuccess = await login(data);
      if (!isSuccess) {
        return;
      }

      const user = useAuthStore.getState().user;

      if (user?.roles.includes("ADMIN")) {
        await useAuthStore.getState().logout();
        toast.error("Tài khoản quản trị viên không được phép đăng nhập tại đây");
        return;
      }

      if (user?.roles.includes("OWNER")) {
        navigate("/owner");
      } else {
        navigate("/");
      }
    } catch (err: unknown) {
      // Error is already handled by Axios Interceptor (toast)
      // and Auth Store (setting error state for the UI box)
      console.error("Login failed", err);
    }
  };

  return (
    <div className="relative flex w-full flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Header ────────────────────────────────────────────── */}
      <header className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.28em] text-muted-foreground backdrop-blur-sm">
          <ShieldCheck className="size-3 text-primary" />
          T-Sport · Cổng đăng nhập
        </span>
        <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-[2.75rem]">
          Chào mừng trở lại với{" "}
          <span className="bg-gradient-to-br from-primary via-primary to-accent-sport bg-clip-text italic text-transparent">
            T-Sport.
          </span>
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          Đăng nhập để tiếp tục quản lý lịch đặt sân, kèo đang mở và các trận đã
          lên lịch.
        </p>
      </header>

      {/* ── Form ──────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Email */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              aria-invalid={!!errors.email}
              className="h-11 pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p
              role="alert"
              className="text-xs font-medium text-destructive animate-in slide-in-from-left-1"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Mật khẩu
            </Label>
            <Link
              to="/auth/forgot-password"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:text-primary/80"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              disabled={isLoading}
              aria-invalid={!!errors.password}
              className="h-11 pl-10 pr-11"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p
              role="alert"
              className="text-xs font-medium text-destructive animate-in slide-in-from-left-1"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Server error */}
        {error && (
          <Alert
            variant="destructive"
            className="border-destructive/40 bg-destructive/5 animate-in zoom-in-95"
          >
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Submit */}
        <Button
          className="group h-11 w-full bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/92 hover:shadow-primary/30"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 data-icon="inline-start" className="animate-spin" />
              Đang vào sân...
            </>
          ) : (
            <>
              Đăng nhập
              <ArrowRight
                data-icon="inline-end"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </>
          )}
        </Button>
      </form>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
            Hoặc
          </span>
          <Separator className="flex-1" />
        </div>

        <Link
          to="/auth/register"
          className="group flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex flex-col">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Lần đầu đến T-Sport?
            </span>
            <span className="font-display text-base font-black italic tracking-tight text-foreground">
              Tạo tài khoản miễn phí
            </span>
          </div>
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          Bằng việc đăng nhập, bạn đồng ý với{" "}
          <Link
            to="/terms"
            className="font-semibold text-foreground/80 underline-offset-2 hover:underline"
          >
            Điều khoản
          </Link>{" "}
          và{" "}
          <Link
            to="/privacy"
            className="font-semibold text-foreground/80 underline-offset-2 hover:underline"
          >
            Chính sách bảo mật
          </Link>{" "}
          của T-Sport.
        </p>
      </div>
    </div>
  );
}
