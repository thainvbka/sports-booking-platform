import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { accountService } from "@/services/account.service";
import { useAuthStore } from "@/store/useAuthStore";
import type { ApiError } from "@/types";
import {
  Building2,
  Camera,
  Loader2,
  Mail,
  Phone,
  Save,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isOwner = user?.roles.includes("OWNER");

  // Sync form state when dialog opens or user changes
  useEffect(() => {
    if (open && user) {
      setFullName(user.full_name || "");
      setPhoneNumber(user.phone_number || "");
      setCompanyName(user.profiles?.owner?.company_name || "");
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  }, [open, user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh đại diện không được vượt quá 5MB");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Họ và tên không được để trống");
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error("Số điện thoại không được để trống");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("full_name", fullName.trim());
      formData.append("phone_number", phoneNumber.trim());

      if (isOwner && companyName.trim()) {
        formData.append("company_name", companyName.trim());
      }

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await accountService.updateProfile(formData);

      if (response.data?.user) {
        // Update user state in Zustand store
        setUser(response.data.user);
      }

      toast.success("Cập nhật hồ sơ thành công!");
      onOpenChange(false);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(
        apiError?.message || "Không thể cập nhật hồ sơ. Vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const displayAvatar = avatarPreview || user?.avatar;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg font-bold italic tracking-tight">
            <User className="size-5 text-primary" />
            Hồ sơ cá nhân
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cá nhân và ảnh đại diện của bạn.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="group relative">
              <Avatar className="size-20 border-2 border-border shadow-sm">
                <AvatarImage src={displayAvatar} alt={fullName} />
                <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-110"
                title="Đổi ảnh đại diện"
              >
                <Camera className="size-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            {avatarFile && (
              <span className="text-xs text-muted-foreground">
                {avatarFile.name}
              </span>
            )}
          </div>

          <Separator />

          {/* Email (read-only) */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="profile-email"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                id="profile-email"
                value={user?.email || ""}
                disabled
                className="h-10 pl-10 opacity-70"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Email không thể thay đổi.
            </p>
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="profile-fullname"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              Họ và tên <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                id="profile-fullname"
                placeholder="Nhập họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                className="h-10 pl-10"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="profile-phone"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              Số điện thoại <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                id="profile-phone"
                placeholder="Nhập số điện thoại"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
                className="h-10 pl-10"
              />
            </div>
          </div>

          {/* Company Name (Owner only) */}
          {isOwner && (
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="profile-company"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Tên công ty
              </Label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                <Input
                  id="profile-company"
                  placeholder="Nhập tên công ty"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={isLoading}
                  className="h-10 pl-10"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
