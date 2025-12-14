import { useState, useEffect } from "react";
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin khu phức hợp</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin chi tiết của khu phức hợp
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="complex_name">Tên khu phức hợp</Label>
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
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="complex_address">Địa chỉ</Label>
              <Textarea
                id="complex_address"
                value={formData.complex_address}
                onChange={(e) =>
                  setFormData({ ...formData, complex_address: e.target.value })
                }
                placeholder="Ví dụ: 123 Đường ABC, Quận XYZ, TP.HCM"
                required
                minLength={10}
                maxLength={500}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
