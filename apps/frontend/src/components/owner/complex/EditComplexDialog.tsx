import { FormDialogShell } from "@/components/shared/dialogs/FormDialogShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ComplexDetail } from "@/types";
import { Building2, MapPin, Pencil } from "lucide-react";
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
    <FormDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Chỉnh sửa khu phức hợp"
      description="Cập nhật thông tin định danh sẽ hiển thị công khai."
      icon={Pencil}
      accentGradientClass="bg-gradient-to-r from-primary via-sky-500 to-primary"
      formId="edit-complex-form"
      isSubmitting={isSubmitting}
      submittingLabel="Đang lưu…"
      submitLabel={
        <>
          <Pencil data-icon="inline-start" />
          Lưu thay đổi
        </>
      }
    >
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
    </FormDialogShell>
  );
}
