import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ComplexDetail } from "@/types";
import { Building2, Loader2, MapPin, Pencil } from "lucide-react";
import { useEffect, useState } from "react";

interface EditComplexDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complex: ComplexDetail;
  onSubmit: (data: {
    complex_name?: string;
    complex_address?: string;
  }) => Promise<void>;
}

export function EditComplexDialog({
  open,
  onOpenChange,
  complex,
  onSubmit,
}: EditComplexDialogProps) {
  const [formData, setFormData] = useState({
    complex_name: complex.complex_name,
    complex_address: complex.complex_address,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        complex_name: complex.complex_name,
        complex_address: complex.complex_address,
      });
    }
  }, [open, complex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update complex:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[32rem]">
        <div
          aria-hidden
          className="h-1 w-full bg-gradient-to-r from-primary via-sky-500 to-primary"
        />

        <div className="flex flex-col gap-5 px-6 py-5">
          <DialogHeader className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <Pencil className="size-5" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <Badge
                  variant="outline"
                  className="h-5 w-fit gap-1 rounded-full border-primary/20 bg-primary/10 px-2 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-primary"
                >
                  <Building2 className="size-2.5" />
                  Complex editor
                </Badge>
                <DialogTitle className="font-display text-lg font-black italic tracking-tight">
                  Chỉnh sửa khu phức hợp
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Cập nhật thông tin định danh sẽ hiển thị công khai.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            id="edit-complex-form"
          >
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="complex_name"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                <Building2 className="size-3.5" />
                Tên khu phức hợp
              </Label>
              <Input
                id="complex_name"
                value={formData.complex_name}
                onChange={(e) =>
                  setFormData({ ...formData, complex_name: e.target.value })
                }
                placeholder="Ví dụ: Sân thể thao ABC"
                required
                minLength={3}
                maxLength={100}
                className="h-10"
              />
              <p className="text-[11px] text-muted-foreground">
                3–100 ký tự. Khách hàng sẽ thấy tên này trên trang tìm kiếm.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="complex_address"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                <MapPin className="size-3.5" />
                Địa chỉ
              </Label>
              <Textarea
                id="complex_address"
                value={formData.complex_address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    complex_address: e.target.value,
                  })
                }
                placeholder="Ví dụ: 123 Đường ABC, Quận XYZ, TP.HCM"
                required
                minLength={10}
                maxLength={500}
                rows={3}
                className="resize-none"
              />
              <p className="text-[11px] text-muted-foreground">
                10–500 ký tự. Ghi cụ thể số nhà, đường, quận/huyện để dễ tìm.
              </p>
            </div>
          </form>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-full"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="edit-complex-form"
              disabled={isSubmitting}
              className="rounded-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  Đang lưu…
                </>
              ) : (
                <>
                  <Pencil data-icon="inline-start" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
