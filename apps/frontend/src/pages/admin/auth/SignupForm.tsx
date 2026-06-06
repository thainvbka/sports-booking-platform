"use client";

import { authBg } from "@/assets";
import { Logo } from "@/components/admin/layout/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { registerSchema, type registerInput } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { register: registerAdmin, isLoading, error } = useAuthStore();
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<registerInput>({
    resolver: zodResolver(registerSchema.shape.body),
    defaultValues: {
      role: "ADMIN",
    },
  });

  const onSubmit = async (data: registerInput) => {
    if (data.password !== confirmPassword) {
      setConfirmError("Mật khẩu xác nhận không khớp");
      return;
    }
    setConfirmError("");

    try {
      await registerAdmin(data);
      setEmailSent(data.email);
      setIsSuccess(true);
    } catch (err) {
      toast.error("Đăng ký quản trị viên thất bại. Vui lòng kiểm tra lại.");
      console.error("Admin registration failed:", err);
    }
  };

  if (isSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden p-6 md:p-8 text-center max-w-lg mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
              <MailCheck className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold">Kiểm tra email của bạn</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Chúng tôi đã gửi link kích hoạt tài khoản quản trị viên đến{" "}
              <strong>{emailSent}</strong>.
              <br />
              Vui lòng kiểm tra hòm thư của bạn để hoàn tất việc đăng ký.
            </p>
            <div className="pt-4">
              <Link to="/admin/login">
                <Button className="rounded-full px-6">Quay lại đăng nhập</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <input type="hidden" {...register("role")} value="ADMIN" />

              <div className="flex justify-center mb-2">
                <Link to="/" className="flex items-center gap-2 font-medium">
                  <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                    <Logo size={24} />
                  </div>
                  <span className="text-xl">Sport Booking Admin</span>
                </Link>
              </div>

              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-balance">
                  Enter your information to register as an administrator
                </p>
              </div>

              {/* Full Name */}
              <div className="grid gap-2">
                <Label htmlFor="full_name">Họ và tên</Label>
                <Input
                  id="full_name"
                  placeholder="Nguyễn Văn A"
                  disabled={isLoading}
                  required
                  {...register("full_name")}
                />
                {errors.full_name && (
                  <p className="text-xs text-destructive">
                    {errors.full_name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  disabled={isLoading}
                  required
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="grid gap-2">
                <Label htmlFor="phone_number">Số điện thoại</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="0987654321"
                  disabled={isLoading}
                  required
                  {...register("phone_number")}
                />
                {errors.phone_number && (
                  <p className="text-xs text-destructive">
                    {errors.phone_number.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  disabled={isLoading}
                  required
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  disabled={isLoading}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmError) setConfirmError("");
                  }}
                  required
                />
                {confirmError && (
                  <p className="text-xs text-destructive">{confirmError}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required />
                <Label htmlFor="terms" className="text-xs">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Privacy Policy
                  </a>
                </Label>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/admin/login" className="underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src={authBg}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.95]"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
