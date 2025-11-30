import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOwnerStore } from "@/store/useOwnerStore";
import { ComplexStatus } from "@/types";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus } from "lucide-react";

interface ComplexFormData {
  complex_name: string;
  complex_address: string;
  complex_image?: string;
}

interface ComplexFormDialogProps {
  trigger?: React.ReactNode;
}

export function ComplexFormDialog({ trigger }: ComplexFormDialogProps) {
  const owner = useOwnerStore((state) => state.owner);
  const addComplex = useOwnerStore((state) => state.addComplex);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ComplexFormData>();

  const onSubmit = async (data: ComplexFormData) => {
    if (!owner) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newComplex = {
      id: Math.random().toString(36).substring(7),
      owner_id: owner.id,
      owner,
      complex_name: data.complex_name,
      complex_address: data.complex_address,
      status: ComplexStatus.PENDING,
      complex_image: data.complex_image,
      verification_docs: [],
      sub_fields: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addComplex(newComplex);
    setIsLoading(false);
    setOpen(false);
    reset();
  };

  if (!owner?.stripe_onboarding_complete) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {trigger || (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tạo khu phức hợp
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yêu cầu kết nối Stripe</DialogTitle>
            <DialogDescription>
              Bạn cần kết nối Stripe trước khi tạo khu phức hợp.
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertDescription>
              Vui lòng vào Dashboard để hoàn tất việc kết nối thanh toán Stripe.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tạo khu phức hợp
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo khu phức hợp mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin khu phức hợp của bạn. Sau khi tạo, admin sẽ xem xét
            và phê duyệt.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="complex_name">Tên khu phức hợp</Label>
              <Input
                id="complex_name"
                placeholder="Ví dụ: Sân Thể Thao Bình Thạnh"
                {...register("complex_name", {
                  required: "Tên khu phức hợp là bắt buộc",
                  minLength: {
                    value: 5,
                    message: "Tên phải có ít nhất 5 ký tự",
                  },
                })}
              />
              {errors.complex_name && (
                <p className="text-sm text-destructive">
                  {errors.complex_name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="complex_address">Địa chỉ</Label>
              <Input
                id="complex_address"
                placeholder="123 Đường ABC, Quận X, TP.HCM"
                {...register("complex_address", {
                  required: "Địa chỉ là bắt buộc",
                })}
              />
              {errors.complex_address && (
                <p className="text-sm text-destructive">
                  {errors.complex_address.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="complex_image">URL hình ảnh (tùy chọn)</Label>
              <Input
                id="complex_image"
                placeholder="https://example.com/image.jpg"
                {...register("complex_image")}
              />
              <p className="text-xs text-muted-foreground">
                Trong phiên bản thực, bạn có thể upload hình ảnh
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang tạo..." : "Tạo khu phức hợp"}
            </Button>
          </DialogFooter>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Khu phức hợp sẽ ở trạng thái "Chờ duyệt" và cần Admin phê duyệt
            trước khi hoạt động.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
