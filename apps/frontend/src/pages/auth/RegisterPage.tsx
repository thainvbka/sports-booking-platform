import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type registerInput,
} from "@sports-booking-platform/validation";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error } = useAuthStore();
  const [role, setRole] = useState<"PLAYER" | "OWNER">("PLAYER");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<registerInput>({
    resolver: zodResolver(registerSchema.shape.body),
    defaultValues: {
      role: "PLAYER",
    },
  });

  const handleRoleChange = (newRole: "PLAYER" | "OWNER") => {
    setRole(newRole);
    reset({
      role: newRole,
      email: "",
      password: "",
      full_name: "",
      phone_number: "",
      ...(newRole === "OWNER" ? { company_name: "" } : {}),
    } as registerInput);
  };

  const onSubmit = async (data: registerInput) => {
    try {
      await registerUser(data);

      if (data.role === "OWNER") {
        navigate("/owner");
      } else {
        navigate("/");
      }
    } catch (err) {
      // Error is handled in store
      console.error("Registration failed", err);
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Tạo tài khoản
        </h1>
        <p className="text-sm text-muted-foreground">
          Nhập thông tin để bắt đầu hành trình của bạn
        </p>
      </div>

      <Tabs
        value={role}
        onValueChange={(value) => handleRoleChange(value as "PLAYER" | "OWNER")}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-2 h-11 p-1 bg-muted/50 backdrop-blur-sm">
          <TabsTrigger
            value="PLAYER"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            Tôi là người chơi
          </TabsTrigger>
          <TabsTrigger
            value="OWNER"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            Tôi là chủ sân
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("role")} value={role} />

        <div className="space-y-2">
          <Label htmlFor="full_name">Họ tên</Label>
          <Input
            id="full_name"
            placeholder="Nguyễn Văn A"
            disabled={isLoading}
            className="h-11 bg-background/50 backdrop-blur-sm transition-all focus:ring-2 focus:ring-primary/20"
            {...register("full_name")}
          />
          {errors.full_name && (
            <p className="text-sm text-destructive font-medium animate-in slide-in-from-left-1">
              {errors.full_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="name@example.com"
            type="email"
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
          <Label htmlFor="phone_number">Số điện thoại</Label>
          <Input
            id="phone_number"
            placeholder="0123456789"
            disabled={isLoading}
            className="h-11 bg-background/50 backdrop-blur-sm transition-all focus:ring-2 focus:ring-primary/20"
            {...register("phone_number")}
          />
          {errors.phone_number && (
            <p className="text-sm text-destructive font-medium animate-in slide-in-from-left-1">
              {errors.phone_number.message}
            </p>
          )}
        </div>

        {role === "OWNER" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <Label htmlFor="company_name">Tên công ty / Cơ sở</Label>
            <Input
              id="company_name"
              placeholder="Khu Thể Thao ABC"
              disabled={isLoading}
              className="h-11 bg-background/50 backdrop-blur-sm transition-all focus:ring-2 focus:ring-primary/20"
              {...register("company_name")}
            />
            {/* @ts-ignore */}
            {errors.company_name && (
              /* @ts-ignore */
              <p className="text-sm text-destructive font-medium animate-in slide-in-from-left-1">
                {errors.company_name.message}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            id="password"
            type="password"
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
              Đang tạo tài khoản...
            </>
          ) : (
            "Đăng ký"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Đã có tài khoản? </span>
        <Link
          to="/auth/login"
          className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
        >
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
