import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { accountService } from "@/services/account.service";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { Building2, User } from "lucide-react";

interface AddRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleToAdd: "PLAYER" | "OWNER";
}

export function AddRoleDialog({
  open,
  onOpenChange,
  roleToAdd,
}: AddRoleDialogProps) {
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (roleToAdd === "OWNER" && !companyName.trim()) {
      toast.error("Vui lòng nhập tên công ty");
      return;
    }

    setIsLoading(true);
    try {
      const data =
        roleToAdd === "OWNER"
          ? { role: roleToAdd, company_name: companyName }
          : { role: roleToAdd };

      const response = await accountService.addRole(data);

      // Update access token with new roles (refresh token is in cookie)
      if (response.data) {
        localStorage.setItem("accessToken", response.data.accessToken);

        // Refresh user data to get updated roles
        await refreshUser();
      }

      toast.success(
        roleToAdd === "OWNER"
          ? "Đã thêm vai trò Chủ khu phức hợp thành công!"
          : "Đã thêm vai trò Người chơi thành công!"
      );

      onOpenChange(false);
      setCompanyName("");

      // Redirect to new role page
      if (roleToAdd === "OWNER") {
        window.location.href = "/owner";
      } else {
        window.location.href = "/";
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Không thể thêm vai trò. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {roleToAdd === "OWNER" ? (
              <>
                <Building2 className="h-5 w-5 text-blue-600" />
                Tham gia với vai trò quản lý khu phức hợp
              </>
            ) : (
              <>
                <User className="h-5 w-5 text-green-600" />
                Tham gia với vai trò người chơi
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {roleToAdd === "OWNER"
              ? "Bạn sẽ có thể tạo và quản lý các khu phức hợp thể thao của mình."
              : "Bạn sẽ có thể đặt sân và quản lý các đặt chỗ của mình."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {roleToAdd === "OWNER" && (
            <div className="space-y-2">
              <Label htmlFor="company_name">
                Tên công ty <span className="text-red-500">*</span>
              </Label>
              <Input
                id="company_name"
                placeholder="Nhập tên công ty của bạn"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
