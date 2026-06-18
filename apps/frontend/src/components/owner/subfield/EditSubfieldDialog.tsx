import { FormDialogShell } from "@/components/shared/dialogs/FormDialogShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SubfieldDetail } from "@/types";
import { SportType } from "@/types";
import { getSportTypeLabel } from "@/utils";
import { Dribbble, Pencil, Tag, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface EditSubfieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subfield: SubfieldDetail;
  onSubmit: (data: {
    subfield_name: string;
    sport_type: string;
    capacity: number;
  }) => Promise<void>;
}

const SPORT_TYPES = [
  SportType.FOOTBALL,
  SportType.BASKETBALL,
  SportType.TENNIS,
  SportType.BADMINTON,
  SportType.VOLLEYBALL,
  SportType.PICKLEBALL,
];

export function EditSubfieldDialog({
  open,
  onOpenChange,
  subfield,
  onSubmit,
}: EditSubfieldDialogProps) {
  const [formData, setFormData] = useState({
    subfield_name: subfield.sub_field_name,
    sport_type: subfield.sport_type,
    capacity: subfield.capacity,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        subfield_name: subfield.sub_field_name,
        sport_type: subfield.sport_type,
        capacity: subfield.capacity,
      });
    }
  }, [open, subfield]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update subfield:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Chỉnh sửa sân con"
      description="Định danh và cấu hình cơ bản của sân."
      icon={Pencil}
      accentGradientClass="bg-gradient-to-r from-primary via-emerald-500 to-primary"
      formId="edit-subfield-form"
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
        id="edit-subfield-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="subfield_name"
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            <Tag className="size-3.5" />
            Tên sân con
          </Label>
          <Input
            id="subfield_name"
            value={formData.subfield_name}
            onChange={(e) =>
              setFormData({ ...formData, subfield_name: e.target.value })
            }
            placeholder="Ví dụ: Sân 1"
            required
            className="h-10"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="sport_type"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              <Dribbble className="size-3.5" />
              Loại sân
            </Label>
            <Select
              value={formData.sport_type}
              onValueChange={(value: string) =>
                setFormData({
                  ...formData,
                  sport_type: value as SportType,
                })
              }
            >
              <SelectTrigger id="sport_type" className="w-full">
                <SelectValue placeholder="Chọn loại sân" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SPORT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getSportTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="capacity"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              <Users className="size-3.5" />
              Sức chứa (người)
            </Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  capacity: parseInt(e.target.value) || 0,
                })
              }
              placeholder="Ví dụ: 10"
              required
              className="h-10 tabular-nums"
            />
          </div>
        </div>
      </form>
    </FormDialogShell>
  );
}
