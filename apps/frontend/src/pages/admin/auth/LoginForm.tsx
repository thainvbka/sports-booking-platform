"use client";

import { authBg } from "@/assets";
import { Logo } from "@/components/admin/layout/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { loginSchema, type loginInput } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const { login, logout, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<loginInput>({
    resolver: zodResolver(loginSchema.shape.body),
  });

  const onSubmit = async (data: loginInput) => {
    const isSuccess = await login(data);
    if (!isSuccess) {
      return;
    }

    const user = useAuthStore.getState().user;

    if (!user) {
      return;
    }

    if (!user.roles.includes("ADMIN")) {
      await logout();
      toast.error("Tài khoản này không có quyền truy cập trang quản trị");
      return;
    }

    navigate("/admin");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex justify-center mb-2">
                <Link to="/" className="flex items-center gap-2 font-medium">
                  <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                    <Logo size={24} />
                  </div>
                  <span className="text-xl">Sport Booking Admin</span>
                </Link>
              </div>
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your Sport Booking Admin account
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  required
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/auth/forgot-password"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  required
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full cursor-pointer">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a
                  href="/admin/signup"
                  className="underline underline-offset-4"
                >
                  Sign up
                </a>
              </div>
              <div className="text-center text-sm">
                <Link to="/auth/login" className="underline underline-offset-4">
                  User login
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
